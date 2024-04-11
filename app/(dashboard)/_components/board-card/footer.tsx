import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface FooterProps {
  isFavorite: boolean
  title: string
  authorLabel: string
  createAtLabel: string
  onClick: () => void
  disabled: boolean
}

export default function Footer({
  isFavorite,
  title,
  authorLabel,
  createAtLabel,
  onClick,
  disabled,
}: FooterProps) {
  return (
    <div className="relative bg-white p-3">
      <p className="text-[13px] truncate max-w-[calc(100%-20px)]">{title}</p>
      <p className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] truncate text-muted-foreground">
        {authorLabel}, {createAtLabel}
      </p>
      <button
        className={cn(
          'opacity-0 group-hover:opacity-100 transition absolute top-3 right-3 text-muted-foreground hover:text-blue-600',
          disabled && 'cursor-not-allowed opacity-75'
        )}
      >
        <Star
          className={cn('h-4 w-4', isFavorite && 'fill-blue-600 text-blue-600')}
        />
      </button>
    </div>
  )
}
