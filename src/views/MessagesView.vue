<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { LogOut, MessageCircleMore } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'
import BrandMark from '../components/BrandMark.vue'
import ChatList from '../components/ChatList.vue'
import ChatThread from '../components/ChatThread.vue'
import PersonAvatar from '../components/PersonAvatar.vue'
import { useChatStore } from '../store'

const store = useChatStore()
const route = useRoute()
const router = useRouter()
const now = ref(Date.now())
const defaultId = store.sortedChats[0]?.id
const routeId = computed(() => typeof route.params.id === 'string' ? route.params.id : undefined)
const activeChat = computed(() => store.chats.find(chat => chat.id === (routeId.value || defaultId)))
let clock: ReturnType<typeof setInterval>

onMounted(() => {
  clock = setInterval(() => { now.value = Date.now() }, 1_000)
})
onUnmounted(() => clearInterval(clock))

watch(routeId, id => {
  if (id) store.markRead(id)
}, { immediate: true })

function send(text: string) {
  if (activeChat.value) store.sendMessage(activeChat.value.id, text)
  now.value = Date.now()
}

function signOut() {
  store.signOut()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="workspace" :class="{ 'thread-open': routeId }">
    <header class="workspace-header">
      <div class="workspace-header-inner">
        <RouterLink :to="{ name: 'messages', params: { id: '' } }" class="workspace-brand"><BrandMark /></RouterLink>
        <div class="workspace-section"><MessageCircleMore :size="17" aria-hidden="true" /> Kotak masuk</div>
        <div v-if="store.user" class="workspace-profile">
          <PersonAvatar :src="store.user.avatar" :name="store.user.name" />
          <div class="profile-copy">
            <strong>{{ store.user.name }}</strong>
            <span>{{ store.user.email }}</span>
          </div>
          <button class="icon-button logout-button" type="button" aria-label="Keluar" title="Keluar" @click="signOut"><LogOut :size="19" /></button>
        </div>
      </div>
    </header>

    <main class="workspace-main">
      <ChatList :chats="store.sortedChats" :selected-id="activeChat?.id" :unread-count="store.unreadCount" :now="now" @select="router.push({ name: 'messages', params: { id: $event } })" />
      <ChatThread v-if="activeChat" :key="activeChat.id" :chat="activeChat" :now="now" @send="send" @back="router.push({ name: 'messages', params: { id: '' } })" />
    </main>
  </div>
</template>
