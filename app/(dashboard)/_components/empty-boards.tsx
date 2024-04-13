'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

import { useOrganization } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

import { api } from '@/convex/_generated/api'
import { useApiMutation } from '@/hooks/use-api-mutation'
import { toast } from 'sonner'

export default function EmptyBoards() {
  const router = useRouter()
  const { organization } = useOrganization()
  const { mutate, pending } = useApiMutation(api.board.create)

  const onClick = () => {
    if (!organization) return

    mutate({
      title: 'Untitled',
      orgId: organization.id,
    })
      .then((id) => {
        toast.success('Board created')
        router.push(`/board/${id}`)
      })
      .catch(() => toast.error('Failed to created board'))
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image src="/note.svg" alt="Empty" width={110} height={110} />
      <h2 className="text-2xl font-semibold mt-6">Create your first board!</h2>
      <p className="text-muted-foreground text-sm mt-2">
        Start by Creating a board for your organization
      </p>
      <div className="mt-6">
        <Button disabled={pending} size="lg" onClick={onClick}>
          Create board
        </Button>
      </div>
    </div>
  )
}
