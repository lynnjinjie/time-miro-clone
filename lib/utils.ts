import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { Camera } from '@/types/canvas'

const COLORS = ['#845EC2', '#4B4453', '#B0A8B9', '#00896F', '#C34A36']

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length]
}

// make a infinite canvas
export function PointEventToCanvasPoint(e: React.PointerEvent, camera: Camera) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  }
}
