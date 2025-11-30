import { useEffect } from 'react'

interface UseGlobalShortcutsProps {
  onSectionChange: (section: string) => void
  openAIAssistant: () => void
  handleSave: () => void
}

export function useGlobalShortcuts({
  onSectionChange,
  openAIAssistant,
  handleSave
}: UseGlobalShortcutsProps) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 忽略在输入框中的按键
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Ctrl/Cmd + K 打开AI助手
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        openAIAssistant()
        return
      }

      // Ctrl/Cmd + S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
        return
      }

      // Ctrl/Cmd + 1-5 快速切换区域
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault()
        const sections = ['personal', 'experience', 'education', 'skills', 'projects']
        const index = parseInt(e.key) - 1
        if (sections[index]) {
          onSectionChange(sections[index])
        }
        return
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [onSectionChange, openAIAssistant, handleSave])
}
