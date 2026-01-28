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
      className="group relative flex items-start gap-4 rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card hover:shadow-lg dark:hover:shadow-primary/5"
    >
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Avatar className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-105">
        {!imgError && (
          <AvatarImage
            src={link.icon_url || `/api/favicon?domain=${domain}`}
            alt={link.title}
            onError={() => setImgError(true)}
            className="rounded-xl"
          />
        )}
        <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold">{initial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary truncate">{link.title}</span>
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-70 group-hover:translate-x-0" />
        </div>
        {link.description && (
          <p className="mt-1.5 text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">{link.description}</p>
        )}
      </div>
    </a>
  )
}
