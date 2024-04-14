'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { Poppins } from 'next/font/google'
import { Menu } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Hint } from '@/components/hint'
import { Actions } from '@/components/actions'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useRenameModal } from '@/store/use-rename-modal'

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
})
interface InfoProps {
  boardId: string
}

function TabSeparator() {
  return <div className="text-neutral-500 px-1.5">|</div>
}

export default function Info({ boardId }: InfoProps) {
  const data = useQuery(api.board.get, { id: boardId as Id<'boards'> })
  const { onOpen } = useRenameModal()

  if (!data) return <InfoSkeleton />

  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 shadow-md flex items-center">
      <Hint label="Go to boards" side="bottom" sideOffest={10}>
        <Button asChild variant="board" className="px-2">
          <Link href="/">
            <Image src="/logo.svg" alt="Board logo" width={40} height={40} />
            <span
              className={cn(
                'font-semibold text-xl ml-2 text-black',
                font.className
              )}
            >
              Board
            </span>
          </Link>
        </Button>
      </Hint>
      <TabSeparator />
      <Hint label="Edit board" side="bottom" sideOffest={10}>
        <Button
          variant="board"
          className="text-base font-normal px-2"
          onClick={() => onOpen(data._id, data.title)}
        >
          {data.title}
        </Button>
      </Hint>
      <TabSeparator />
      <Actions id={data._id} title={data.title} side="bottom" sideOffset={10}>
        <div>
          <Hint label="Main menu" side="bottom" sideOffest={10}>
            <Button size="icon" variant="board">
              <Menu />
            </Button>
          </Hint>
        </div>
      </Actions>
    </div>
  )
}

export function InfoSkeleton() {
  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 shadow-md flex items-center w-[300px]" />
  )
}
