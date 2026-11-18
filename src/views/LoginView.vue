<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from '@lucide/vue'
import BrandMark from '../components/BrandMark.vue'
import PersonAvatar from '../components/PersonAvatar.vue'
import { avatarPath } from '../chats'
import { useChatStore } from '../store'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const canSignIn = computed(() => Boolean(email.value.trim() && password.value.trim()))
const store = useChatStore()
const router = useRouter()

function signIn() {
  if (store.signIn(email.value, password.value)) router.replace({ name: 'messages' })
}
</script>

<template>
  <main class="login-page">
    <section class="login-side" aria-labelledby="login-title">
      <header class="login-brand"><BrandMark /></header>

      <div class="login-content">
        <div class="login-intro">
          <div class="login-greeting"><Sparkles :size="15" aria-hidden="true" /> MODE DEMO</div>
          <h1 id="login-title">Selamat datang<span>.</span></h1>
          <p>Masuk untuk melanjutkan percakapanmu.</p>
        </div>

        <form class="login-form" novalidate @submit.prevent="signIn">
          <div>
            <label for="email">Alamat email</label>
            <div class="input-field">
              <Mail :size="19" aria-hidden="true" />
              <input id="email" v-model="email" type="email" autocomplete="email" placeholder="nama@example.com" required />
            </div>
          </div>
          <div>
            <label for="password">Kata sandi</label>
            <div class="input-field">
              <LockKeyhole :size="18" aria-hidden="true" />
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Masukkan kata sandi" required />
              <button class="password-toggle" type="button" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" :size="19" />
                <Eye v-else :size="19" />
              </button>
            </div>
          </div>
          <button class="sign-in" type="submit" :disabled="!canSignIn">Masuk <ArrowRight :size="19" aria-hidden="true" /></button>
        </form>
        <p class="login-note">Coba dengan email dan kata sandi apa saja.</p>
      </div>
      <footer class="login-footer"><span class="footer-dot" /> Pesan kembali ke awal saat halaman dimuat ulang.</footer>
    </section>

    <aside class="login-art" aria-label="Tentang Sidechat">
      <div class="art-stage" aria-hidden="true">
        <div class="orbit orbit-outer" />
        <div class="orbit orbit-middle" />
        <div class="orbit orbit-inner" />
        <span class="orbit-star orbit-star-one">✦</span>
        <span class="orbit-star orbit-star-two">✦</span>
        <span class="orbit-point orbit-point-one" />
        <span class="orbit-point orbit-point-two" />
        <div class="art-message art-message-first">
          <PersonAvatar :src="avatarPath('women-44')" name="Maya Chen" />
          <div><strong>Maya Chen</strong><p>Ngopi akhir pekan ini? ☕</p></div>
        </div>
        <div class="art-message art-message-second">
          <p>Ngopi? Selalu mau! 💚</p>
          <PersonAvatar :src="avatarPath('men-32')" name="Oliver Brooks" />
        </div>
        <div class="art-reaction">✨</div>
      </div>
      <div class="art-caption">
        <p>Semua berawal<br />dari satu <em>sapaan.</em></p>
        <span>Tempat mengobrol dengan orang-orang terdekatmu.</span>
      </div>
    </aside>
  </main>
</template>
