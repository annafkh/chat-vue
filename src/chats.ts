export type Message = {
  id: string
  text: string
  time: number
} & ({ mine: true; readByRecipient: boolean } | { mine: false; senderId?: string })

interface Person {
  id: string
  name: string
  avatar: string
}

export type Chat = {
  id: string
  name: string
  unread: number
  messages: Message[]
} & ({ kind: 'direct'; avatar: string; online: boolean } | { kind: 'group'; members: Person[] })

const contacts = [
  ['Maya Chen', 'women-44', true, 0, 'Sip, aku bawa kamera ya 📸', [
    'Sabtu ini jadi ketemu, kan?',
    'Jadi dong. Di kedai kopi deket taman, yuk.',
    'Nah, aku pengin nyobain roti di situ. Jam 10?',
    'Bisa. Habis ngopi kita mampir ke pasar, ya.',
  ]],
  ['Oliver Brooks', 'men-32', true, 3, 'Udah aku kirim referensi desainnya.', [
    'Desain yang kemarin lanjut, kan?',
    'Lanjut. Aku masih nyari referensi buat bagian depannya.',
  ]],
  ['Sofia Martinez', 'women-47', true, 2, 'Oke, kita pakai yang itu aja.', [
    'Enaknya ketemu di mana?',
    'Di tempat biasa aja gimana? Deket buat kita berdua.',
  ]],
  ['Noah Williams', 'men-11', false, 0, 'Minggu depan lanjut ngobrol, ya.', [
    'Aku lagi di jalan nih. Nanti telepon balik ya?',
    'Santai, kapan-kapan juga boleh kok.',
  ]],
  ['Amelia Park', 'women-65', false, 0, 'Wah, aku suka banget. Makasih ya!', [
    'Eh, foto yang kemarin masih ada?',
    'Ada, nih aku kirim yang paling bagus.',
  ]],
] as const

export function avatarPath(file: string) {
  return `${import.meta.env.BASE_URL}avatars/${file}.jpg`
}

export function seedChats(now = Date.now()): Chat[] {
  const directChats = contacts.map(([name, avatar, online, unread, text, baseHistory], index): Chat => {
    const id = name.toLowerCase().replaceAll(' ', '-')
    const date = new Date(now)
    if (index >= 3) date.setDate(date.getDate() - (index - 2))
    const lastTime = date.getTime() - (index === 0 ? 20_000 : index * 17 * 60_000)
    const unreadHistory = ['Oh iya, hampir lupa.', 'Aku barusan nemu yang cocok.']
    const history = [...baseHistory, ...unreadHistory.slice(0, Math.max(0, unread - 1))]

    return {
      kind: 'direct', id, name, avatar: avatarPath(avatar), online, unread,
      messages: [...history, text].map((line, position): Message => {
        const message = {
          id: `${id}-${position}`,
          text: line,
          time: lastTime - (history.length - position) * 120_000,
        }
        return position < baseHistory.length && position % 2 === 1
          ? { ...message, mine: true, readByRecipient: true }
          : { ...message, mine: false }
      }),
    }
  })

  const members = contacts.slice(0, 3).map(([name, avatar]) => ({
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    avatar: avatarPath(avatar),
  }))
  const lastMinute = Math.floor((now - 6 * 60_000) / 60_000) * 60_000
  const groupHistory = [
    [0, -56, 'Minggu pagi ada yang mau jalan di taman?'],
    [0, -34, 'Habis itu sarapan bareng, yuk.'],
    [1, -20, 'Aku ikut. Ketemu di pintu depan aja?'],
    [2, 8, 'Boleh, jam 7 aja ya biar nggak kepanasan.'],
    [2, 24, 'Aku bawain roti buat sarapan.'],
  ] as const

  return [...directChats, {
    kind: 'group',
    id: 'teman-sekitar',
    name: 'Teman Sekitar',
    members,
    unread: 2,
    messages: groupHistory.map(([member, seconds, text], index) => ({
      id: `teman-sekitar-${index}`,
      text,
      time: lastMinute + seconds * 1_000,
      mine: false,
      senderId: members[member].id,
    })),
  }]
}

export function latestMessage(chat: Chat) {
  return chat.messages[chat.messages.length - 1]
}

export function messageSender(chat: Chat, message: Message) {
  if (message.mine) return undefined
  return chat.kind === 'direct' ? chat : chat.members.find(member => member.id === message.senderId)
}

export function groupMessages(messages: Message[]) {
  const groups: { messages: Message[]; latest: Message }[] = []

  for (const message of messages) {
    const group = groups[groups.length - 1]
    const previous = group?.latest
    const sameSender = previous && previous.mine === message.mine &&
      (previous.mine || (!message.mine && previous.senderId === message.senderId))
    if (sameSender && Math.floor(previous.time / 60_000) === Math.floor(message.time / 60_000)) {
      group.messages.push(message)
      group.latest = message
    } else {
      groups.push({ messages: [message], latest: message })
    }
  }

  return groups
}
