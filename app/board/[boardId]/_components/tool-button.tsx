'use client'

import { Hint } from '@/components/hint'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface ToolButtonProps {
  label: string
  icon: LucideIcon
  onClick: () => void
  isActive?: boolean
  isDisabled?: boolean
}

export default function ToolButton({
  label,
  icon: Icon,
  onClick,
  isActive,
  isDisabled,
}: ToolButtonProps) {
  return (
    <Hint label={label} side="right" sideOffest={14}>
      <Button
        variant={isActive ? 'boardActive' : 'board'}
        disabled={isDisabled}
        size="icon"
        onClick={onClick}
      >
        <Icon />
      </Button>
    </Hint>
  )
}
