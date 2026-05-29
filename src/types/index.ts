export interface User {
  id: string
  nickname: string
  avatar?: string
  createdAt: Date
}

export interface Room {
  id: string
  name: string
  code: string
  isActive: boolean
  currentSongId?: string
  createdAt: Date
  updatedAt: Date
  members?: RoomMember[]
  queueItems?: QueueItem[]
}

export interface RoomMember {
  id: string
  roomId: string
  userId: string
  joinedAt: Date
  user: User
}

export interface QueueItem {
  id: string
  roomId: string
  userId: string
  youtubeId: string
  title: string
  thumbnail: string
  position: number
  isPlaying: boolean
  isPlayed: boolean
  votes: number
  createdAt: Date
  user: User
}

export interface Song {
  youtubeId: string
  title: string
  thumbnail: string
  channelTitle: string
}
