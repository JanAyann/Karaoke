'use client'

import React from 'react'

interface YouTubePlayerProps {
  videoId: string
  onEnd?: () => void
  onError?: (error: string) => void
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onEnd, onError }) => {
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
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}
