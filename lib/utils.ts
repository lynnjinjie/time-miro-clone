import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { Camera, Color } from '@/types/canvas'

const COLORS = ['#845EC2', '#D65DB1', '#FFC75F', '#00896F', '#C34A36']

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length]
}

// make a infinite canvas
export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera
) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  }
}

export function rgbToHex({ r, g, b }: Color) {
  // number translate to hex
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  return hex
}
