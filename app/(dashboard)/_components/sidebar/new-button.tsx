'use client'

import { Plus } from 'lucide-react'

import { CreateOrganization } from '@clerk/nextjs'

import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
import { Hint } from '@/components/hint'

export function NewButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="aspect-square">
          <Hint
            label="Create Organization"
            side="right"
            align="start"
            sideOffest={18}
          >
            <button className="w-full h-full bg-white/25 flex items-center justify-center rounded-md opacity-60 hover:opacity-100 transition">
              <Plus className="text-white" />
            </button>
          </Hint>
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none max-w-[480px]">
        <CreateOrganization />
      </DialogContent>
    </Dialog>
  )
}
