import { rgbToHex } from '@/lib/utils'
import { EllipseLayer } from '@/types/canvas'

interface EllipseProps {
  id: string
  layer: EllipseLayer
  onLayerPointerDown: (e: React.PointerEvent, layer: string) => void
  selectionColor?: string
}

export default function Ellipse({
  id,
  layer,
  onLayerPointerDown,
  selectionColor,
}: EllipseProps) {
  const { x, y, width, height, fill } = layer
  return (
    <ellipse
      className="drop-shadow-md"
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      cx={width / 2}
      cy={height / 2}
      rx={width / 2}
      ry={height / 2}
      strokeWidth={1}
      stroke={selectionColor || 'transparent'}
      fill={fill ? rgbToHex(fill) : '#ccc'}
    />
  )
}
