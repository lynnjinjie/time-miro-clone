'use client'

import { useOthers, useSelf } from '@/liveblocks.config'
import { connectionIdToColor } from '@/lib/utils'

import UserAvatar from './user-avatar'

const MAX_SHOWN_USERS = 2

export default function Participants() {
  const otherUsers = useOthers()
  const currentUser = useSelf()
  const haveMoreUsers = otherUsers.length > MAX_SHOWN_USERS

  return (
    <div className="absolute top-2 right-2 bg-white h-12 rounded-md shadow-md flex items-center px-1.5">
      <div className="flex gap-x-2">
        {otherUsers.slice(0, MAX_SHOWN_USERS).map(({ connectionId, info }) => {
          return (
            <UserAvatar
              key={connectionId}
              src={info?.picture}
              name={info?.name}
              fallback={info?.name?.[0] || 'T'}
              borderColor={connectionIdToColor(connectionId)}
            />
          )
        })}
        {currentUser && (
          <UserAvatar
            src={currentUser.info?.picture}
            name={`${currentUser.info?.name} (You)`}
            fallback={currentUser.info?.name?.[0]}
            borderColor={connectionIdToColor(currentUser.connectionId)}
          />
        )}
        {haveMoreUsers && (
          <UserAvatar
            name={`${otherUsers.length - MAX_SHOWN_USERS} more`}
            fallback={`+ ${otherUsers.length - MAX_SHOWN_USERS}`}
          />
        )}
      </div>
    </div>
  )
}

export function ParticipantsSkeleton() {
  return (
    <div className="absolute top-2 right-2 bg-white h-12 rounded-md shadow-md flex items-center px-1.5 w-[100px]" />
  )
}
