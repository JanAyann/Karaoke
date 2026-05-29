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
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Also check periodically for fullscreen state
  useEffect(() => {
    const interval = setInterval(() => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isFs)
    }, 500)

    return () => clearInterval(interval)
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
        ref={iframeRef}
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      {isFullscreen && onNext && (
        <button
          onClick={onNext}
          className="fixed right-8 bottom-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-full transition-all duration-200 z-50"
          title="Next Song"
        >
          <SkipForward size={32} className="text-white" />
        </button>
      )}
    </div>
  )
}
