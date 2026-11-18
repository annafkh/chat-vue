import type { Pinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useChatStore } from './store'
import LoginView from './views/LoginView.vue'
import MessagesView from './views/MessagesView.vue'

export function createAppRouter(pinia: Pinia) {
  const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
      { path: '/', redirect: { name: 'login' } },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/messages/:id?', name: 'messages', component: MessagesView },
      { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
    ],
  })

  router.beforeEach(to => {
    const store = useChatStore(pinia)
    if (to.name === 'messages' && !store.user) return { name: 'login' }
    if (to.name === 'login' && store.user) return { name: 'messages' }
    if (to.params.id && !store.chats.some(chat => chat.id === to.params.id)) return { name: 'messages' }
  })

  return router
}
