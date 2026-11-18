<script setup lang="ts">
import PersonAvatar from './PersonAvatar.vue'
import type { Chat } from '../chats'

defineProps<{ chat: Chat }>()
</script>

<template>
  <PersonAvatar v-if="chat.kind === 'direct'" :src="chat.avatar" :name="chat.name" :online="chat.online" />
  <span v-else class="avatar group-avatar" aria-hidden="true">
    <img v-for="member in chat.members.slice(0, 2)" :key="member.id" :src="member.avatar" alt="" width="24" height="44" />
  </span>
</template>
