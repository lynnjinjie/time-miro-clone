'use client'

import { memo } from 'react'
import { BringToFront, SendToBack, Trash2 } from 'lucide-react'

import { useMutation, useSelf } from '@/liveblocks.config'
import { Button } from '@/components/ui/button'
import { Hint } from '@/components/hint'
import { useSelectionBounds } from '@/hooks/use-selection-bounds'
import { useDeleteLayers } from '@/hooks/use-delete-layers'
import { Camera, Color } from '@/types/canvas'

import { ColorPicker } from './color-picker'

interface SelectionToolsProps {
  camera: Camera
  setLastUserColor: (lastUserColor: Color) => void
}

export const SelectionTools = memo(function SelectionTools({
  camera,
  setLastUserColor,
}: SelectionToolsProps) {
  const selection = useSelf((me) => me.presence.selection)

  const moveToFront = useMutation(
    ({ storage }) => {
      const layerIds = storage.get('layerIds')
      const indices: number[] = []

      const arr = layerIds.toImmutable()
      for (let i = 0; i < arr.length; i++) {
        if (selection.includes(arr[i])) {
          indices.push(i)
        }
      }

      for (let i = indices.length - 1; i >= 0; i--) {
        layerIds.move(indices[i], arr.length - 1 - (indices.length - 1 - i))
      }
    },
    [selection]
  )
  const moveToBack = useMutation(
    ({ storage }) => {
      const layerIds = storage.get('layerIds')
      const indices: number[] = []

      const arr = layerIds.toArray()
      for (let i = 0; i < arr.length; i++) {
        if (selection.includes(arr[i])) {
          indices.push(i)
        }
      }

      for (let i = 0; i < indices.length; i++) {
        layerIds.move(indices[i], i)
      }
    },
    [selection]
  )

  const setFill = useMutation(
    ({ storage, self }, fill: Color) => {
      const layers = storage.get('layers')

      setLastUserColor(fill)

      selection.forEach((id) => {
        layers.get(id)?.set('fill', fill)
      })
    },
    [selection, setLastUserColor]
  )

  const deleteLayers = useDeleteLayers()

  const selectionBounds = useSelectionBounds()

  if (!selectionBounds) return null

  const x = selectionBounds.width / 2 + selectionBounds.x + camera.x
  const y = selectionBounds.y + camera.y

  return (
    <div
      className="absolute p-3 rounded-xl bg-white shadow-sm flex border select-none"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
      }}
    >
      <ColorPicker onChange={setFill} />
      <div className="flex flex-col gap-y-0.5">
        <Hint label="Bring to front">
          <Button variant="board" size="icon" onClick={moveToFront}>
            <BringToFront />
          </Button>
        </Hint>
        <Hint label="Send to back" side="bottom">
          <Button variant="board" size="icon" onClick={moveToBack}>
            <SendToBack />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
        <Hint label="Delete">
          <Button size="icon" variant="board" onClick={deleteLayers}>
            <Trash2 />
          </Button>
        </Hint>
      </div>
    </div>
  )
})

SelectionTools.displayName = 'SelectionTools'
