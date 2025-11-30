'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface AddCardButtonProps {
  onAdd: () => void
  text: string
}

export function AddCardButton({ onAdd, text }: AddCardButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onAdd}
      className="w-full p-5 border border-dashed border-gray-300/60 rounded-xl 
                 hover:border-blue-500/50 hover:bg-blue-50/50 hover:text-blue-600 
                 transition-all duration-300 group flex items-center justify-center gap-2 backdrop-blur-sm"
      type="button"
    >
      <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
        <Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
      </div>
      <span className="font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{text}</span>
    </motion.button>
  )
}
