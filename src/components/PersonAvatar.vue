<script setup lang="ts">
defineProps<{ src: string; name: string; online?: boolean }>()
</script>

<template>
  <span class="avatar" :title="name">
    <img :src="src" alt="" width="48" height="48" />
    <span v-if="online" class="presence-dot" />
  </span>
</template>
