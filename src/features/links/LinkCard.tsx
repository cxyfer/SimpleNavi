import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Link } from '@/lib/types'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TagBadge } from './TagBadge'

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
      className="group relative flex items-start gap-5 rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_0_30px_-5px] hover:shadow-primary/30 dark:hover:shadow-primary/20"
    >
      {/* Animated gradient border on hover */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

      {/* Corner accent */}
      <div className="absolute right-0 top-0 h-12 w-12 overflow-hidden rounded-tr-xl">
        <div className="absolute -right-6 -top-6 h-12 w-12 rotate-45 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <Avatar className="h-14 w-14 shrink-0 rounded-lg ring-2 ring-border/40 transition-all duration-300 group-hover:ring-primary/50 group-hover:shadow-[0_0_15px_-3px] group-hover:shadow-primary/40">
        {!imgError && (
          <AvatarImage
            src={link.icon_url || `/api/favicon?domain=${domain}`}
            alt={link.title}
            onError={() => setImgError(true)}
            className="rounded-lg"
          />
        )}
        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 font-mono text-lg font-bold text-primary">
          {initial}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary truncate">
            {link.title}
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-80 group-hover:translate-x-0 group-hover:text-primary" />
        </div>
        {link.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {link.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60 font-mono">
          <span className="truncate">{domain}</span>
        </div>
        {link.tags && link.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {link.tags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </a>
  )
}
