import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Link } from '@/lib/types'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface LinkCardProps {
  link: Link
}

export function LinkCard({ link }: LinkCardProps) {
  const [imgError, setImgError] = useState(false)

  const domain = new URL(link.url).hostname
  const initial = link.title.charAt(0).toUpperCase()

  const handleClick = () => {
    api.links.click(link.id)
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
    >
      <Avatar className="h-10 w-10">
        {!imgError && (
          <AvatarImage
            src={link.icon_url || `/api/favicon?domain=${domain}`}
            alt={link.title}
            onError={() => setImgError(true)}
          />
        )}
        <AvatarFallback className="bg-primary/10 text-primary">{initial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-medium truncate">{link.title}</span>
          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
        </div>
        {link.description && (
          <p className="text-sm text-muted-foreground truncate">{link.description}</p>
        )}
      </div>
    </a>
  )
}
