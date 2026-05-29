import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({
  className,
  type = 'text',
  ...props
}) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full px-4 py-3 rounded-xl bg-[#0a0a0a]/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300',
        className
      )}
      {...props}
    />
  )
}
