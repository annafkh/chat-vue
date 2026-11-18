<script setup lang="ts">
const logoUrl = `${import.meta.env.BASE_URL}sidechat-logo.png`
</script>

<template>
  <span class="brand" aria-label="Sidechat">
    <span class="brand-icon"><img :src="logoUrl" alt="" width="39" height="39" /></span>
    <span>sidechat<span class="brand-period">.</span></span>
  </span>
</template>
