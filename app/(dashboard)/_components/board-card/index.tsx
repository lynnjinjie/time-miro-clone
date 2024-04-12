'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Actions } from '@/components/actions'

import Overlay from './overlay'
import Footer from './footer'

interface BoardCardProps {
  id: string
  title: string
  imageUrl: string
  authorId: string
  authorName: string
  createAt: number
  orgId: string
  isFavorite: boolean
}

export default function BoardCard({
  id,
  title,
  imageUrl,
  authorId,
  authorName,
  createAt,
  orgId,
  isFavorite,
}: BoardCardProps) {
  const { userId } = useAuth()

  const authorLabel = userId === authorId ? 'You' : authorName
  const createAtLabel = formatDistanceToNow(createAt, {
    addSuffix: true,
  })

  return (
    <Link href={`board/${id}`}>
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          <Image src={imageUrl} alt={title} fill className="object-fill" />
          <Overlay />
          <Actions id={id} title={title} side="right">
            <button className="absolute top-1 right-1 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity outline-none">
              <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
            </button>
          </Actions>
        </div>
        <Footer
          isFavorite={isFavorite}
          title={title}
          authorLabel={authorLabel}
          createAtLabel={createAtLabel}
          onClick={() => {}}
          disabled={false}
        />
      </div>
    </Link>
  )
}

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-[100/127] rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  )
}
