export type Message = {
  id: string
  text: string
  time: number
} & ({ mine: true; readByRecipient: boolean } | { mine: false })

export interface Chat {
  id: string
  name: string
  avatar: string
  online: boolean
  unread: number
  messages: Message[]
}

const contacts = [
  ['Maya Chen', 'women-44', true, 0, 'Sip! Aku bawa kamera ya 📸'],
  ['Oliver Brooks', 'men-32', true, 3, 'Aku sudah kirim referensi desain terbarunya!'],
  ['Sofia Martinez', 'women-47', true, 2, 'Oke, kita pakai rencana itu ya ✨'],
  ['Noah Williams', 'men-11', false, 0, 'Minggu depan kita ngobrol lagi, ya.'],
  ['Amelia Park', 'women-65', false, 0, 'Wah, aku jadi senang banget!'],
] as const

const mayaHistory = [
  'Hai! Sabtu ini kita masih jadi ketemu?',
  'Jadi dong! Mau ketemu di kedai kopi kecil dekat taman?',
  'Mau! Aku sudah lama ingin coba roti kapulaganya. Jam 10, ya?',
  'Jam 10 bisa! Habis itu kita jalan kaki ke pasar, yuk.',
]

export function avatarPath(file: string) {
  return `${import.meta.env.BASE_URL}avatars/${file}.jpg`
}

export function seedChats(now = Date.now()): Chat[] {
  return contacts.map(([name, avatar, online, unread, text], index) => {
    const id = name.toLowerCase().replaceAll(' ', '-')
    const date = new Date(now)
    if (index >= 3) date.setDate(date.getDate() - (index - 2))
    const lastTime = date.getTime() - (index === 0 ? 20_000 : index * 17 * 60_000)
    const baseHistory = index === 0 ? mayaHistory : [
      'Hai! Gimana kabarmu?',
      'Baik! Aku juga baru mau kirim pesan ke kamu.',
    ]
    const unreadHistory = ['Ada kabar baru nih.', 'Oh iya, satu lagi sebelum aku lupa.']
    const history = [...baseHistory, ...unreadHistory.slice(0, Math.max(0, unread - 1))]

    return {
      id, name, avatar: avatarPath(avatar), online, unread,
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
}

export function latestMessage(chat: Chat) {
  return chat.messages[chat.messages.length - 1]
}
