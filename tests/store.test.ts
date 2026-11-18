import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { groupMessages, latestMessage, messageSender } from '../src/chats'
import type { Message } from '../src/chats'
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
    expect(store.chats.filter(chat => chat.kind === 'direct')).toHaveLength(5)
    expect(store.chats.filter(chat => chat.kind === 'group').map(chat => chat.name)).toEqual(['Teman Sekitar'])
  })

  it('marks only the selected conversation as read', () => {
    const store = useChatStore()
    const chat = store.chats.find(item => item.unread > 0)!
    const previousTotal = store.unreadCount
    const previousUnread = chat.unread
    expect(chat.messages.find(message => message.mine)).toMatchObject({ readByRecipient: true })
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
    store.markRead(chat.id)
    expect(latestMessage(chat)).toMatchObject({
      text: 'Hello!\nSee you soon.',
      time,
      mine: true,
      readByRecipient: false,
    })
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

  it('adds outgoing group messages and retains the author of incoming messages', () => {
    const store = useChatStore()
    store.signIn('chris_evans@example.com', 'password')
    const group = store.chats.find(chat => chat.kind === 'group')!
    expect(messageSender(group, latestMessage(group))?.name).toBe('Sofia Martinez')
    expect(store.sendMessage(group.id, 'Aku ikut!')).toBe(true)
    expect(store.sortedChats[0].id).toBe(group.id)
    expect(latestMessage(group)).toMatchObject({ text: 'Aku ikut!', mine: true, readByRecipient: false })
  })
})

describe('grouped messages', () => {
  it('combines consecutive messages from the same sender in the same minute', () => {
    const messages: Message[] = [
      { id: 'a', text: 'Pertama', time: 60_001, mine: false, senderId: 'maya' },
      { id: 'b', text: 'Kedua', time: 115_000, mine: false, senderId: 'maya' },
      { id: 'c', text: 'Ketiga', time: 116_000, mine: false, senderId: 'oliver' },
      { id: 'd', text: 'Keempat', time: 117_000, mine: false, senderId: 'maya' },
      { id: 'e', text: 'Kelima', time: 119_999, mine: true, readByRecipient: true },
      { id: 'f', text: 'Keenam', time: 120_000, mine: true, readByRecipient: false },
      { id: 'g', text: 'Ketujuh', time: 128_000, mine: true, readByRecipient: false },
    ]
    const groups = groupMessages(messages)
    expect(groups.map(group => group.messages.map(message => message.id))).toEqual([
      ['a', 'b'], ['c'], ['d'], ['e'], ['f', 'g'],
    ])
    expect(groups.map(group => group.latest.id)).toEqual(['b', 'c', 'd', 'e', 'g'])
  })
})
