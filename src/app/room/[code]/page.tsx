'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Room, QueueItem, Song } from '@/types'
import { YouTubePlayer } from '@/components/karaoke/YouTubePlayer'
import { QueueList } from '@/components/karaoke/QueueList'
import { SongSearch } from '@/components/karaoke/SongSearch'
import { QRCodeComponent } from '@/components/karaoke/QRCode'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Copy, Share2, Users, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export default function RoomPage() {
  const router = useRouter()
  const params = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentSong, setCurrentSong] = useState<QueueItem | null>(null)
  const [nickname, setNickname] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queueError, setQueueError] = useState<string | null>(null)
  const [queueChannel, setQueueChannel] = useState<RealtimeChannel | null>(null)
  const [memberChannel, setMemberChannel] = useState<RealtimeChannel | null>(null)
  const [showNicknameInput, setShowNicknameInput] = useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const nick = searchParams.get('nickname')
    if (nick) {
      setNickname(nick)
    } else {
      setShowNicknameInput(true)
      setLoading(false)
    }
  }, [])

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim()) {
      const url = new URL(window.location.href)
      url.searchParams.set('nickname', nickname.trim())
      window.location.href = url.toString()
    }
  }

  useEffect(() => {
    if (!params.code || !nickname || showNicknameInput) {
      if (!showNicknameInput) {
        setError('Room code and nickname are required')
      }
      setLoading(false)
      return
    }

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms?code=${params.code}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Room not found')
        }

        setRoom(data)
        setQueue(data.queueItems || [])
        setIsHost(data.members?.[0]?.user?.nickname === nickname)
        setError(null)
      } catch (error) {
        console.error('Error fetching room:', error)
        setError(error instanceof Error ? error.message : 'Failed to load room')
        setTimeout(() => router.push('/'), 3000)
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()

    // Set up Supabase Realtime subscriptions
    let queueSub: RealtimeChannel | null = null
    let memberSub: RealtimeChannel | null = null

    if (room?.id) {
      // Subscribe to QueueItem changes
      queueSub = supabase
        .channel(`queue-${room.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
          },
          (payload) => {
            console.log('Queue change:', payload)
            // Refetch queue when changes occur
            fetch(`/api/rooms?code=${params.code}`)
              .then(res => res.json())
              .then(data => {
                setQueue(data.queueItems || [])
                setQueueError(null)
              })
              .catch(err => console.error('Error refetching queue:', err))
          }
        )
        .subscribe((status, err) => {
          console.log('Queue subscription status:', status, err)
        })
      setQueueChannel(queueSub)

      // Subscribe to RoomMember changes
      memberSub = supabase
        .channel(`members-${room.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'RoomMember',
            filter: `roomId=eq.${room.id}`,
          },
          (payload) => {
            console.log('Member change:', payload)
            // Refetch room when members change
            fetch(`/api/rooms?code=${params.code}`)
              .then(res => res.json())
              .then(data => {
                setRoom(data)
                setIsHost(data.members?.[0]?.user?.nickname === nickname)
              })
              .catch(err => console.error('Error refetching room:', err))
          }
        )
        .subscribe((status) => {
          console.log('Member subscription status:', status)
        })
      setMemberChannel(memberSub)
    }

    return () => {
      if (queueSub) {
        supabase.removeChannel(queueSub)
      }
      if (memberSub) {
        supabase.removeChannel(memberSub)
      }
    }
  }, [params.code, nickname, router, room?.id])

  const handleAddToQueue = async (song: Song) => {
    if (!room) {
      setQueueError('Room not loaded')
      return
    }

    setQueueError(null)
    try {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          userId: room.members?.[0]?.userId || '',
          youtubeId: song.youtubeId,
          title: song.title,
          thumbnail: song.thumbnail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to queue')
      }

      const updatedQueue = [...queue, data]
      setQueue(updatedQueue)
    } catch (error) {
      console.error('Error adding to queue:', error)
      setQueueError(error instanceof Error ? error.message : 'Failed to add song to queue')
    }
  }

  const handlePlaySong = (item: QueueItem) => {
    setCurrentSong(item)
  }

  const handleRemoveSong = async (item: QueueItem) => {
    setQueueError(null)
    try {
      const response = await fetch(`/api/queue/${item.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove song')
      }

      const updatedQueue = queue.filter((i) => i.id !== item.id)
      setQueue(updatedQueue)
    } catch (error) {
      console.error('Error removing song:', error)
      setQueueError(error instanceof Error ? error.message : 'Failed to remove song')
    }
  }

  const handleReorderQueue = async (fromIndex: number, toIndex: number) => {
    try {
      const newQueue = [...queue]
      const [movedItem] = newQueue.splice(fromIndex, 1)
      newQueue.splice(toIndex, 0, movedItem)

      setQueue(newQueue)

      // Update the order in the database
      for (let i = 0; i < newQueue.length; i++) {
        await fetch(`/api/queue/${newQueue[i].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position: i }),
        })
      }
    } catch (error) {
      console.error('Error reordering queue:', error)
      setQueueError(error instanceof Error ? error.message : 'Failed to reorder queue')
    }
  }

  const handleSkipSong = () => {
    // Automatically play next song if available
    handlePlayNext()
  }

  const handlePlayNext = () => {
    if (queue.length > 0) {
      const nextSong = queue[0]
      setCurrentSong(nextSong)
      
      // Remove the played song from queue
      handleRemoveSong(nextSong)
    }
  }

  const handleVideoError = (errorMsg: string) => {
    console.error('Video error:', errorMsg)
    setQueueError(`Video error: ${errorMsg}`)
  }

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code)
        .then(() => alert('Room code copied!'))
        .catch(() => setQueueError('Failed to copy room code'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading room...</p>
        </div>
      </div>
    )
  }

  if (showNicknameInput) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Enter Your Name</h2>
            <p className="text-gray-400 mb-6">Please enter your nickname to join the room</p>
            <form onSubmit={handleNicknameSubmit} className="space-y-4">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
                autoFocus
              />
              <Button type="submit" className="w-full">
                Join Room
              </Button>
            </form>
          </div>
        </Card>
      </div>
    )
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h2 className="text-xl font-bold mb-2 text-red-400">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>Go Back</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] text-white p-3 custom-scrollbar relative overflow-hidden">
      {/* Subtle glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-[98%] mx-auto relative z-10 h-screen flex flex-col">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{room?.name}</h1>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <Users size={16} />
              <span>{room?.members?.length || 0} members</span>
              <span className="text-purple-400">•</span>
              <span className="text-purple-400 font-mono">{room?.code}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={copyRoomCode}>
              <Copy size={16} className="mr-2" />
              {room?.code}
            </Button>
            <Button variant="secondary" onClick={() => setShowQR(true)}>
              <Share2 size={16} className="mr-2" />
              QR Code
            </Button>
            <Button variant="secondary" onClick={() => setShowLeaveConfirm(true)}>
              Go Home
            </Button>
          </div>
        </div>

        <Modal isOpen={showQR} onClose={() => setShowQR(false)}>
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4 text-white">Share Room</h3>
            {room && <QRCodeComponent value={`${window.location.origin}/room/${room.code}`} />}
            <p className="mt-4 text-gray-400 text-sm text-center">Scan to join this room</p>
            <Button className="mt-6" onClick={() => setShowQR(false)}>
              Back
            </Button>
          </div>
        </Modal>

        <Modal isOpen={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4 text-white">Leave Room?</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to leave this room and go back to the home page?</p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowLeaveConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={() => router.push('/')}>
                Leave
              </Button>
            </div>
          </div>
        </Modal>

        {queueError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <p className="text-red-400 text-sm">{queueError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
          {/* Left Sidebar - 30% width */}
          <div className="w-full lg:w-[30%] flex flex-col gap-4 order-2 lg:order-1 overflow-hidden">
            {/* Add Songs Card */}
            <Card className="w-full">
              <h2 className="text-xl font-bold mb-3 text-white">Add Songs</h2>
              <SongSearch onSongSelect={handleAddToQueue} />
            </Card>

            {/* Queue Songs Card */}
            <Card className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-bold mb-3 text-white">Queue ({queue.length})</h2>
              <div className="flex-1 overflow-hidden">
                <QueueList
                  queue={queue}
                  onPlay={handlePlaySong}
                  onRemove={handleRemoveSong}
                  onReorder={handleReorderQueue}
                />
              </div>
            </Card>
          </div>

          {/* Right Main Content - 65-70% width */}
          <div className="w-full lg:w-[70%] order-1 lg:order-2 overflow-hidden">
            <Card className="h-full border-purple-500/30 shadow-[0_0_40px_rgba(139,92,246,0.15)] flex flex-col">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Now Playing</h2>
              {currentSong ? (
                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                  <div className="flex-1 rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl min-h-0">
                    <YouTubePlayer
                      videoId={currentSong.youtubeId}
                      onEnd={handleSkipSong}
                      onError={handleVideoError}
                      onNext={handleSkipSong}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button variant="primary" className="flex-1 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]" onClick={handlePlayNext} disabled={queue.length === 0}>
                      Next Song
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-10">
                  <p className="text-2xl mb-6 font-light">No song playing</p>
                  {queue.length > 0 && (
                    <Button
                      className="py-4 px-10 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => handlePlaySong(queue[0])}
                    >
                      Play Next Song
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
