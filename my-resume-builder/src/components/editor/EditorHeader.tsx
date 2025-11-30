import React from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface EditorHeaderProps {
  onOpenAIAssistant: () => void
  onSave: () => void
}

export function EditorHeader({ onOpenAIAssistant }: EditorHeaderProps) {
  const { t } = useLanguage()
  return (
    <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200/60 bg-white/80 backdrop-blur-md z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
           {/* 顶部标题区域 */}
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white ring-1 ring-blue-600/20">
               <User className="w-4 h-4" />
             </div>
             <h1 className="text-lg font-bold text-gray-900 tracking-tight">{t.editor.title}</h1>
           </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAIAssistant}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-colors border border-purple-100 hover:border-purple-200"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.editor.aiAssistant}</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
