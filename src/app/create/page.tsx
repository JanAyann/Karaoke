'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

function CreateRoomContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roomName, setRoomName] = useState('')
  const [nickname, setNickname] = useState(searchParams.get('nickname') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !nickname.trim()) {
      setError('Room name and nickname are required')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName.trim(), nickname: nickname.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room')
      }

      router.push(`/room/${data.room.code}?nickname=${encodeURIComponent(nickname.trim())}`)
    } catch (error) {
      console.error('Error creating room:', error)
      setError(error instanceof Error ? error.message : 'Failed to create room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Create Karaoke Room
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room Name</label>
            <Input
              placeholder="My Awesome Karaoke Night"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value)
                setError(null)
              }}
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your Nickname</label>
            <Input
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError(null)
              }}
              disabled={loading}
            />
          </div>
          
          <Button
            className="w-full"
            onClick={handleCreateRoom}
            disabled={!roomName.trim() || !nickname.trim() || loading}
          >
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
          
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push('/')}
            disabled={loading}
          >
            Back
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default function CreateRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex items-center justify-center p-4">Loading...</div>}>
      <CreateRoomContent />
    </Suspense>
  )
}
