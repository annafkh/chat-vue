<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Check, Info, Send, Smile, X } from '@lucide/vue'
import PersonAvatar from './PersonAvatar.vue'
import type { Chat } from '../chats'
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

function scrollToLatest() {
  if (messages.value) messages.value.scrollTop = messages.value.scrollHeight
}

onMounted(scrollToLatest)
watch(() => props.chat.messages.length, scrollToLatest, { flush: 'post' })

function startsDay(index: number) {
  return index === 0 || !sameDay(new Date(props.chat.messages[index - 1].time), new Date(props.chat.messages[index].time))
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
      <PersonAvatar :src="chat.avatar" :name="chat.name" :online="chat.online" />
      <div class="min-w-0 flex-1">
        <h2 id="thread-title" class="truncate">{{ chat.name }}</h2>
        <p class="thread-status" :class="{ online: chat.online }"><span />{{ chat.online ? 'Aktif' : 'Tidak aktif' }}</p>
      </div>
      <button class="icon-button details-button" type="button" aria-label="Detail percakapan" :aria-expanded="showDetails" @click="showDetails = !showDetails"><Info :size="21" /></button>
      <div v-if="showDetails" class="thread-details">
        <button class="icon-button details-close" type="button" aria-label="Tutup detail percakapan" @click="showDetails = false"><X :size="17" /></button>
        <PersonAvatar :src="chat.avatar" :name="chat.name" :online="chat.online" />
        <strong>{{ chat.name }}</strong>
        <p>{{ chat.online ? 'Aktif' : 'Tidak aktif' }}</p>
        <p>{{ chat.messages.length }} pesan</p>
      </div>
    </header>

    <div ref="messages" class="message-scroll" role="log" :aria-label="`Percakapan dengan ${chat.name}`">
      <div class="message-stack">
        <template v-for="(message, index) in chat.messages" :key="message.id">
          <div v-if="startsDay(index)" class="day-divider"><span>{{ dayLabel(message.time, now) }}</span></div>
          <div class="message-row" :class="{ mine: message.mine }">
            <PersonAvatar v-if="!message.mine" :src="chat.avatar" :name="chat.name" />
            <div class="message-content">
              <p class="message-bubble">{{ message.text }}</p>
              <div class="message-time">
                <time :datetime="new Date(message.time).toISOString()">{{ clockTime(message.time) }}</time>
                <Check v-if="message.mine" :size="13" aria-label="Terkirim" />
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
      <p class="composer-hint">Enter untuk mengirim · Shift + Enter untuk baris baru</p>
    </form>
  </section>
</template>
