import { Kalam } from 'next/font/google'
import Contenteditable, { ContentEditableEvent } from 'react-contenteditable'

import { TextLayer } from '@/types/canvas'
import { cn, rgbToHex } from '@/lib/utils'
import { useMutation } from '@/liveblocks.config'

const font = Kalam({
  subsets: ['latin'],
  weight: ['400'],
})

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96
  const scaleFactor = 0.5
  const fontSizeBasedOnHeight = height * scaleFactor
  const fontSizeBasedOnWeight = width * scaleFactor

  return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWeight, maxFontSize)
}

interface TextProps {
  id: string
  layer: TextLayer
  onLayerPointerDown: (e: React.PointerEvent, layer: string) => void
  selectionColor?: string
}

export default function Text({
  id,
  layer,
  onLayerPointerDown,
  selectionColor,
}: TextProps) {
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
      }}
    >
      <Contenteditable
        html={value || ''}
        onChange={handleContentChange}
        className={cn(
          'w-full h-full flex items-center justify-center text-center drop-shadow-md outline-none',
          font.className
        )}
        style={{
          fontSize: calculateFontSize(width, height),
          color: fill ? rgbToHex(fill) : '#000',
        }}
      />
    </foreignObject>
  )
}
