'use client'

import { useStorage } from '@/liveblocks.config'
import { LayerType } from '@/types/canvas'
import { memo } from 'react'
import Rectangle from './layer-type/rectangle'
import Ellipse from './layer-type/ellipse'
import Text from './layer-type/text'
import Note from './layer-type/note'

interface LayerPreviewProps {
  id: string
  onLayerPointerDown: (e: React.PointerEvent, layer: string) => void
  selectionColor?: string
}

export const LayerPreview = memo(function LayerPreview({
  id,
  onLayerPointerDown,
  selectionColor,
}: LayerPreviewProps) {
  const layer = useStorage((root) => root.layers.get(id))
  if (!layer) return null

  switch (layer.type) {
    case LayerType.Note:
      return (
        <Note
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Text:
      return (
        <Text
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Ellipse:
      return (
        <Ellipse
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Rectangle:
      return (
        <Rectangle
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    default:
      console.warn('Unknown layer type')
      return null
  }
})

LayerPreview.displayName = 'LayerPreview'
