'use client'

import React, { useState, useEffect, useRef } from 'react'
import { SkipForward } from 'lucide-react'

interface YouTubePlayerProps {
  videoId: string
  onEnd?: () => void
  onError?: (error: string) => void
  onNext?: () => void
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onEnd, onError, onNext }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (!videoId) {
    return (
      <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">⚠️ Error</p>
          <p className="text-gray-400 text-sm">No video ID provided</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-black rounded-lg overflow-hidden relative">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      {isFullscreen && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 bottom-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-200"
          title="Next Song"
        >
          <SkipForward size={24} className="text-white" />
        </button>
      )}
    </div>
  )
}
