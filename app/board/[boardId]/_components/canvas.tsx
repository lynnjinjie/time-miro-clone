'use client'

import { useCallback, useState } from 'react'

import { CanvasState, CanvasMode, Camera } from '@/types/canvas'
import {
  useHistory,
  useCanUndo,
  useCanRedo,
  useMutation,
} from '@/liveblocks.config'
import { PointEventToCanvasPoint } from '@/lib/utils'

import Info from './info'
import Participants from './participants'
import Toolbar from './toolbar'
import { CursorsPresence } from './cursors-presence'

interface CanvasProps {
  boardId: string
}

export default function Canvas({ boardId }: CanvasProps) {
  const [canvasState, setCanvaseState] = useState<CanvasState>({
    mode: CanvasMode.None,
  })

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })

  const { undo, redo } = useHistory()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault()

      const current = PointEventToCanvasPoint(e, camera)

      setMyPresence({ cursor: current })
    },
    []
  )

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null })
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.x - e.deltaY,
    }))
  }, [])

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
      <svg
        className="w-screen h-screen"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onWheel={onWheel}
      >
        <g>
          <CursorsPresence />
        </g>
      </svg>
    </main>
  )
}
