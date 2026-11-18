import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { latestMessage } from '../src/chats'
import { useChatStore } from '../src/store'

describe('the chat store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('requires both fields and creates a profile from the email', () => {
    const store = useChatStore()
    expect(store.signIn('', 'password')).toBe(false)
    expect(store.signIn('chris_evans@example.com', ' ')).toBe(false)
    expect(store.user).toBeNull()
    expect(store.signIn('chris_evans@example.com', 'password')).toBe(true)
    expect(store.user?.name).toBe('Chris Evans')
    expect(store.chats).toHaveLength(5)
  })

  it('marks only the selected conversation as read', () => {
    const store = useChatStore()
    const chat = store.chats.find(item => item.unread > 0)!
    const previousTotal = store.unreadCount
    const previousUnread = chat.unread
    store.markRead(chat.id)
    expect(chat.unread).toBe(0)
    expect(store.unreadCount).toBe(previousTotal - previousUnread)
  })

  it('uses the sent message as the latest preview and moves that chat to the top', () => {
    const store = useChatStore()
    store.signIn('chris_evans@example.com', 'password')
    const chat = store.sortedChats[store.sortedChats.length - 1]
    const time = Date.now()
    expect(store.sendMessage(chat.id, '   ', time)).toBe(false)
    expect(store.sendMessage(chat.id, '  Hello!\nSee you soon.  ', time)).toBe(true)
    expect(store.sortedChats[0].id).toBe(chat.id)
    expect(latestMessage(chat)).toMatchObject({ text: 'Hello!\nSee you soon.', time, mine: true })
  })

  it('starts fresh after signing out and rejects messages without a session', () => {
    const store = useChatStore()
    const id = store.chats[0].id
    store.signIn('chris_evans@example.com', 'password')
    store.sendMessage(id, 'Session-only message')
    store.signOut()
    expect(store.sendMessage(id, 'Signed out')).toBe(false)
    store.signIn('chris_evans@example.com', 'password')
    expect(store.chats[0].messages.some(message => message.text === 'Session-only message')).toBe(false)
  })
})
