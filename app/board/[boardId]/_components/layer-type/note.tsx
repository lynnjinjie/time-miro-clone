import { Kalam } from 'next/font/google'
import Contenteditable, { ContentEditableEvent } from 'react-contenteditable'

import { NoteLayer } from '@/types/canvas'
import { cn, getContrastingTextColor, rgbToHex } from '@/lib/utils'
import { useMutation } from '@/liveblocks.config'

const font = Kalam({
  subsets: ['latin'],
  weight: ['400'],
})

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96
  const scaleFactor = 0.15
  const fontSizeBasedOnHeight = height * scaleFactor
  const fontSizeBasedOnWeight = width * scaleFactor

  return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWeight, maxFontSize)
}

interface NoteProps {
  id: string
  layer: NoteLayer
  onLayerPointerDown: (e: React.PointerEvent, layer: string) => void
  selectionColor?: string
}

export default function Note({
  id,
  layer,
  onLayerPointerDown,
  selectionColor,
}: NoteProps) {
  const { x, y, width, height, fill, value } = layer

  const updateValue = useMutation(({ storage }, newValue: string) => {
    const layers = storage.get('layers')

    layers.get(id)?.set('value', newValue)
  }, [])

  function handleContentChange(e: ContentEditableEvent) {
    updateValue(e.target.value)
  }

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : 'none',
        backgroundColor: fill ? rgbToHex(fill) : '#000',
      }}
      className="shadow-md drop-shadow-xl"
    >
      <Contenteditable
        html={value || ''}
        onChange={handleContentChange}
        className={cn(
          'w-full h-full flex items-center justify-center text-center outline-none',
          font.className
        )}
        style={{
          fontSize: calculateFontSize(width, height),
          color: fill ? getContrastingTextColor(fill) : '#000',
        }}
      />
    </foreignObject>
  )
}
