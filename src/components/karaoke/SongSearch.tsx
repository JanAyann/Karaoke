'use client'

import React, { useState } from 'react'
import { Link } from 'lucide-react'
import { Song } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface SongSearchProps {
  onSongSelect: (song: Song) => void
}

// Extract YouTube video ID from various URL formats
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export const SongSearch: React.FC<SongSearchProps> = ({ onSongSelect }) => {
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUrl = urlInput.trim()
    
    if (!trimmedUrl) {
      alert('Please enter a YouTube URL')
      return
    }

    console.log('Processing URL:', trimmedUrl)
    const videoId = extractVideoId(trimmedUrl)
    console.log('Extracted video ID:', videoId)
    
    if (!videoId) {
      alert('Invalid YouTube URL. Please paste a valid YouTube video URL.\n\nSupported formats:\n- https://youtube.com/watch?v=VIDEO_ID\n- https://youtu.be/VIDEO_ID\n- https://youtube.com/embed/VIDEO_ID\n- Or just the VIDEO_ID')
      return
    }

    setLoading(true)
    try {
      // Fetch video details from YouTube Data API by video ID
      const response = await fetch(`/api/songs/video?videoId=${encodeURIComponent(videoId)}`)
      const data = await response.json()
      
      let song: Song
      
      if (data.error) {
        // Fallback to generic title if API fails
        song = {
          youtubeId: videoId,
          title: `YouTube Video (${videoId})`,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          channelTitle: 'Added via URL',
        }
        console.log('API returned error, using fallback:', data.error)
      } else {
        // Use the video details from the API
        song = {
          youtubeId: data.youtubeId,
          title: data.title,
          thumbnail: data.thumbnail,
          channelTitle: data.channelTitle,
        }
        console.log('Fetched video details from API:', song)
      }
      
      console.log('Video ID extracted:', videoId)
      console.log('Original URL:', trimmedUrl)
      onSongSelect(song)
      setUrlInput('')
      console.log('Song added successfully')
    } catch (error) {
      console.error('Error adding video from URL:', error)
      alert('Failed to add video. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Paste YouTube URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="pl-9 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? '...' : 'Add'}
        </Button>
      </form>
    </div>
  )
}
