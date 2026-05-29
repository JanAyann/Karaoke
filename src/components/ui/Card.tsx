import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl overflow-hidden border border-white/5 hover:border-purple-500/20 transition-all duration-300',
      className
    )}>
      {children}
    </div>
  )
}
