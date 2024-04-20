'use client'

import { memo } from 'react'

import { useOthersConnectionIds, useOthersMapped } from '@/liveblocks.config'
import { shallow } from '@liveblocks/client'
import { rgbToHex } from '@/lib/utils'

import { Cursor } from './cursor'
import Path from './layer-type/path'

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

function Drafts() {
  const others = useOthersMapped(
    (other) => ({
      pencilDraft: other.presence.pencilDraft,
      penColor: other.presence.penColor,
    }),
    shallow
  )

  return (
    <>
      {others.map(([key, other]) => {
        if (other.pencilDraft) {
          return (
            <Path
              key={key}
              x={0}
              y={0}
              points={other.pencilDraft}
              fill={other.penColor ? rgbToHex(other.penColor) : '#000'}
            />
          )
        }
        return null
      })}
    </>
  )
}

export const CursorsPresence = memo(function CursorsPresence() {
  return (
    <>
      <Drafts />
      <Cursors />
    </>
  )
})

CursorsPresence.displayName = 'CursorsPresence'
