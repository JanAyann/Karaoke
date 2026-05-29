import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25',
    secondary: 'bg-[#0a0a0a]/50 border border-white/10 hover:border-purple-500/30 hover:bg-[#0a0a0a]/70 text-white',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25',
    default: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25',
    outline: 'border-2 border-purple-500/30 hover:border-purple-500/60 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
