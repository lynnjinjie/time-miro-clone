'use client'

import { memo } from 'react'

import { useOthersConnectionIds } from '@/liveblocks.config'
import { Cursor } from './cursor'

function Cursors() {
  const ids = useOthersConnectionIds()

  return (
    <>
      {ids.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  )
}

export const CursorsPresence = memo(function CursorsPresence() {
  return (
    <>
      {/* TODO: add pencil */}
      <Cursors />
    </>
  )
})

CursorsPresence.displayName = 'CursorsPresence'
