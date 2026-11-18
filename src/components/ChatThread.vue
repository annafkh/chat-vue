<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Check, CheckCheck, Info, Send, Smile, X } from '@lucide/vue'
import ConversationAvatar from './ConversationAvatar.vue'
import PersonAvatar from './PersonAvatar.vue'
import type { Chat } from '../chats'
import { groupMessages, messageSender } from '../chats'
import { clockTime, dayLabel, sameDay } from '../format'

const props = defineProps<{ chat: Chat; now: number }>()
const emit = defineEmits<{ (event: 'send', text: string): void; (event: 'back'): void }>()

const draft = ref('')
const messages = ref<HTMLElement | null>(null)
const composer = ref<HTMLTextAreaElement | null>(null)
const showDetails = ref(false)
const showEmoji = ref(false)
const emojis = ['😊', '😂', '💚', '✨', '👍', '👋', '☕', '🎉']
const canSend = computed(() => Boolean(draft.value.trim()))
const messageGroups = computed(() => groupMessages(props.chat.messages).map(group => ({
  ...group,
  sender: messageSender(props.chat, group.latest),
  allRead: group.messages.every(message => message.mine && message.readByRecipient),
})))

function scrollToLatest() {
  if (messages.value) messages.value.scrollTop = messages.value.scrollHeight
}

onMounted(scrollToLatest)
watch(() => props.chat.messages.length, scrollToLatest, { flush: 'post' })

function startsDay(index: number) {
  const groups = messageGroups.value
  return index === 0 || !sameDay(new Date(groups[index - 1].latest.time), new Date(groups[index].latest.time))
}

function send() {
  if (!canSend.value) return
  emit('send', draft.value)
  draft.value = ''
  showEmoji.value = false
}

function handleEnter(event: KeyboardEvent) {
  if (event.shiftKey || event.isComposing || event.keyCode === 229) return
  event.preventDefault()
  send()
}

async function insertEmoji(emoji: string) {
  const input = composer.value
  const start = input?.selectionStart ?? draft.value.length
  const end = input?.selectionEnd ?? start
  draft.value = draft.value.slice(0, start) + emoji + draft.value.slice(end)
  showEmoji.value = false
  if (input) {
    await nextTick()
    input.focus()
    input.setSelectionRange(start + emoji.length, start + emoji.length)
  }
}
</script>

<template>
  <section class="thread" aria-labelledby="thread-title">
    <header class="thread-header">
      <button class="icon-button thread-back" type="button" aria-label="Kembali ke daftar pesan" @click="emit('back')"><ArrowLeft :size="21" /></button>
      <ConversationAvatar :chat="chat" />
      <div class="min-w-0 flex-1">
        <h2 id="thread-title" class="truncate">{{ chat.name }}</h2>
        <p v-if="chat.kind === 'group'" class="thread-status">Grup · {{ chat.members.length + 1 }} anggota</p>
        <p v-else class="thread-status" :class="{ online: chat.online }"><span />{{ chat.online ? 'Online' : 'Offline' }}</p>
      </div>
      <button class="icon-button details-button" type="button" aria-label="Info chat" :aria-expanded="showDetails" @click="showDetails = !showDetails"><Info :size="21" /></button>
      <div v-if="showDetails" class="thread-details">
        <button class="icon-button details-close" type="button" aria-label="Tutup info chat" @click="showDetails = false"><X :size="17" /></button>
        <ConversationAvatar :chat="chat" />
        <strong>{{ chat.name }}</strong>
        <template v-if="chat.kind === 'group'">
          <p>{{ chat.members.length + 1 }} anggota</p>
          <ul class="group-members" aria-label="Anggota grup">
            <li v-for="member in chat.members" :key="member.id">
              <PersonAvatar :src="member.avatar" :name="member.name" />
              <span>{{ member.name }}</span>
            </li>
            <li>Kamu</li>
          </ul>
        </template>
        <p v-else>{{ chat.online ? 'Online' : 'Offline' }}</p>
        <p>{{ chat.messages.length }} pesan</p>
      </div>
    </header>

    <div ref="messages" class="message-scroll" role="log" :aria-label="`Chat sama ${chat.name}`">
      <div class="message-stack">
        <template v-for="(group, index) in messageGroups" :key="group.messages[0].id">
          <div v-if="startsDay(index)" class="day-divider"><span>{{ dayLabel(group.latest.time, now) }}</span></div>
          <div class="message-row" :class="{ mine: group.latest.mine }">
            <PersonAvatar v-if="group.sender" :src="group.sender.avatar" :name="group.sender.name" />
            <div class="message-content">
              <div class="message-bubble">
                <p v-if="chat.kind === 'group' && group.sender" class="message-author">{{ group.sender.name }}</p>
                <p v-for="message in group.messages" :key="message.id" class="message-text">{{ message.text }}</p>
              </div>
              <div class="message-time">
                <time :datetime="new Date(group.latest.time).toISOString()">{{ clockTime(group.latest.time) }}</time>
                <CheckCheck v-if="group.allRead" :size="15" role="img" aria-label="Sudah dibaca" />
                <Check v-else-if="group.latest.mine" :size="15" role="img" aria-label="Belum dibaca" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <form class="thread-composer" @submit.prevent="send" @keydown.esc="showEmoji = false">
      <div class="composer-box">
        <button class="icon-button emoji-button" type="button" aria-label="Tambahkan emoji" :aria-expanded="showEmoji" @click="showEmoji = !showEmoji"><Smile :size="22" /></button>
        <div v-if="showEmoji" class="emoji-picker" aria-label="Pilih emoji">
          <button v-for="emoji in emojis" :key="emoji" type="button" @click="insertEmoji(emoji)">{{ emoji }}</button>
        </div>
        <textarea ref="composer" v-model="draft" rows="1" aria-label="Pesan" placeholder="Tulis pesan…" @keydown.enter="handleEnter" />
        <button class="send-button" type="submit" aria-label="Kirim pesan" :disabled="!canSend"><Send :size="18" aria-hidden="true" /></button>
      </div>
      <p class="composer-hint">Enter buat kirim · Shift + Enter buat baris baru</p>
    </form>
  </section>
</template>
