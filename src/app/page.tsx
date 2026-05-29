'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Users, Music } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function Home() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')

  const handleJoinRoom = () => {
    if (roomCode && nickname) {
      router.push(`/room/${roomCode}?nickname=${encodeURIComponent(nickname)}`)
    }
  }

  const handleCreateRoom = () => {
    if (nickname) {
      router.push(`/create?nickname=${encodeURIComponent(nickname)}`)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mic className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              KaraokeHub
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Create or join karaoke rooms and sing together in real-time
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-purple-500/30">
            <div className="text-center mb-6">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Join a Room</h2>
              <p className="text-gray-400">Enter a room code to join an existing karaoke session</p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button
                className="w-full"
                onClick={handleJoinRoom}
                disabled={!roomCode || !nickname}
              >
                Join Room
              </Button>
            </div>
          </Card>

          <Card className="border-pink-500/30">
            <div className="text-center mb-6">
              <Music className="w-16 h-16 text-pink-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Create a Room</h2>
              <p className="text-gray-400">Start a new karaoke session and invite your friends</p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleCreateRoom}
                disabled={!nickname}
              >
                Create Room
              </Button>
            </div>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <h3 className="text-xl font-bold mb-4 text-center">Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎤</span>
                </div>
                <h4 className="font-semibold mb-2">YouTube Integration</h4>
                <p className="text-gray-400 text-sm">Search and play karaoke videos from YouTube</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold mb-2">Real-time Sync</h4>
                <p className="text-gray-400 text-sm">Live queue updates across all connected users</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-semibold mb-2">QR Code Sharing</h4>
                <p className="text-gray-400 text-sm">Share rooms instantly with QR codes</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
