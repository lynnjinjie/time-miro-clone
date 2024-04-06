import Image from 'next/image'

import { useOrganization, useOrganizationList } from '@clerk/nextjs'

import { cn } from '@/lib/utils'

import { Hint } from '@/components/hint'

interface ItemProps {
  id: string
  imageUrl: string
  name: string
}

export function Item({ id, imageUrl, name }: ItemProps) {
  const { organization } = useOrganization()
  const { setActive } = useOrganizationList()

  const isActive = organization?.id === id

  const onClick = () => {
    if (!setActive) return

    setActive({ organization: id })
  }

  return (
    <div className="aspect-square relative">
      <Hint label={name} side="right" align="start" sideOffest={18}>
        <Image
          fill
          src={imageUrl}
          alt={name}
          onClick={onClick}
          className={cn(
            'rounded-md cursor-pointer opacity-75 hover:opacity-100 transition',
            isActive && 'opacity-100'
          )}
        />
      </Hint>
    </div>
  )
}
