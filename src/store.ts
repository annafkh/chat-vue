import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { avatarPath, latestMessage, seedChats } from './chats'
import { nameFromEmail } from './format'

export const useChatStore = defineStore('sidechat', () => {
  const user = ref<{ name: string; email: string; avatar: string } | null>(null)
  const chats = ref(seedChats())
  const sortedChats = computed(() => [...chats.value]
    .sort((a, b) => latestMessage(b).time - latestMessage(a).time))
  const unreadCount = computed(() => chats.value.reduce((total, chat) => total + chat.unread, 0))
  let messageSequence = 0

  function signIn(email: string, password: string) {
    if (!email.trim() || !password.trim()) return false
    chats.value = seedChats()
    user.value = { name: nameFromEmail(email), email: email.trim(), avatar: avatarPath('men-14') }
    return true
  }

  function signOut() {
    user.value = null
  }

  function markRead(id: string) {
    const chat = chats.value.find(item => item.id === id)
    if (chat) chat.unread = 0
  }

  function sendMessage(id: string, text: string, time = Date.now()) {
    const chat = chats.value.find(item => item.id === id)
    const message = text.trim()
    if (!user.value || !chat || !message) return false

    chat.messages.push({
      id: `sent-${++messageSequence}`,
      text: message,
      time,
      mine: true,
      readByRecipient: false,
    })
    markRead(id)
    return true
  }

  return { user, chats, sortedChats, unreadCount, signIn, signOut, markRead, sendMessage }
})
