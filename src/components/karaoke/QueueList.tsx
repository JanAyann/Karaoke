'use client'

import React, { useState } from 'react'
import { QueueItem as QueueItemType } from '@/types'
import { Play, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QueueListProps {
  queue: QueueItemType[]
  currentUserId?: string
  isHost?: boolean
  onPlay?: (item: QueueItemType) => void
  onRemove?: (item: QueueItemType) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export const QueueList: React.FC<QueueListProps> = ({
  queue,
  currentUserId,
  isHost = false,
  onPlay,
  onRemove,
  onReorder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    if (onReorder) {
      onReorder(draggedIndex, index)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
      {queue.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg">No songs in queue</p>
        </div>
      ) : (
        queue.map((item, index) => (
          <div
            key={item.id}
            draggable={!!(isHost && onReorder)}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 bg-[#0a0a0a]/50 border border-white/5 rounded-xl p-3 hover:bg-[#0a0a0a]/70 hover:border-purple-500/20 transition-all duration-300 cursor-default ${
              isHost && onReorder ? 'cursor-move' : ''
            } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
          >
            {isHost && onReorder && (
              <button
                className="text-gray-500 hover:text-purple-400 cursor-grab active:cursor-grabbing transition-colors"
                type="button"
              >
                <GripVertical size={20} />
              </button>
            )}
            
            <span className="text-purple-400 font-bold w-6 text-center">
              {index + 1}
            </span>
            
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-16 h-12 rounded-lg object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">{item.title}</h4>
              <p className="text-gray-500 text-sm">
                Added by {item.user.nickname}
              </p>
            </div>
            
            {isHost && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPlay?.(item)}
                >
                  <Play size={16} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRemove?.(item)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
