<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, X } from '@lucide/vue'
import ConversationAvatar from './ConversationAvatar.vue'
import { latestMessage, messageSender } from '../chats'
import type { Chat } from '../chats'
import { chatTime } from '../format'

const props = defineProps<{ chats: Chat[]; selectedId?: string; unreadCount: number; now: number }>()
const emit = defineEmits<{ (event: 'select', id: string): void }>()

const query = ref('')
const unreadOnly = ref(false)
const results = ref<HTMLElement | null>(null)
const filteredChats = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return props.chats.filter(chat => chat.name.toLocaleLowerCase().includes(search) && (!unreadOnly.value || chat.unread > 0))
})

function preview(chat: Chat) {
  const message = latestMessage(chat)
  const sender = chat.kind === 'group' ? messageSender(chat, message) : undefined
  const author = message.mine ? 'Kamu' : sender?.name
  return author ? `${author}: ${message.text}` : message.text
}

watch([query, unreadOnly], () => {
  if (results.value) results.value.scrollTop = 0
})
</script>

<template>
  <section class="chat-list" aria-labelledby="inbox-title">
    <header class="inbox-heading">
      <div class="flex items-center gap-3">
        <h1 id="inbox-title">Pesan</h1>
        <span v-if="unreadCount" class="inbox-count" :aria-label="`${unreadCount} pesan belum dibaca`">{{ unreadCount }}</span>
      </div>
      <div class="search-field">
        <Search :size="18" aria-hidden="true" />
        <input v-model="query" type="search" aria-label="Cari chat dari nama" placeholder="Cari chat" />
        <button v-if="query" class="icon-button search-clear" type="button" aria-label="Hapus pencarian" @click="query = ''"><X :size="16" /></button>
      </div>
      <div class="inbox-filters" aria-label="Filter chat">
        <button type="button" :aria-pressed="!unreadOnly" @click="unreadOnly = false">Semua</button>
        <button type="button" :aria-pressed="unreadOnly" @click="unreadOnly = true">Belum dibaca</button>
      </div>
    </header>
    <div ref="results" class="conversation-scroll">
      <ul v-if="filteredChats.length" class="conversation-list">
        <li v-for="chat in filteredChats" :key="chat.id">
          <button type="button" class="conversation" :class="{ selected: selectedId === chat.id }" :aria-current="selectedId === chat.id ? 'true' : undefined" @click="emit('select', chat.id)">
            <ConversationAvatar :chat="chat" />
            <span class="conversation-copy">
              <strong>{{ chat.name }}</strong>
              <span class="conversation-preview">{{ preview(chat) }}</span>
            </span>
            <span class="conversation-meta">
              <time :datetime="new Date(latestMessage(chat).time).toISOString()">{{ chatTime(latestMessage(chat).time, now) }}</time>
              <span v-if="chat.unread" class="unread-count" :aria-label="`${chat.unread} pesan belum dibaca`">{{ chat.unread }}</span>
            </span>
          </button>
        </li>
      </ul>
      <p v-else class="list-empty" role="status">{{ query.trim() ? 'Chat-nya nggak ketemu.' : 'Udah kebaca semua.' }}</p>
    </div>
  </section>
</template>
