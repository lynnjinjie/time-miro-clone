'use client'

import { useState } from 'react'

import { CanvasState, CanvasMode } from '@/types/canvas'
import { useHistory, useCanUndo, useCanRedo } from '@/liveblocks.config'

import Info from './info'
import Participants from './participants'
import Toolbar from './toolbar'

interface CanvasProps {
  boardId: string
}

export default function Canvas({ boardId }: CanvasProps) {
  const [canvasState, setCanvaseState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const { undo, redo } = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  return (
    <main className="w-full h-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvaseState={setCanvaseState}
        canUndo={canUndo}
        canRedo={canRedo}
        undo={undo}
        redo={redo}
      />
    </main>
  )
}
