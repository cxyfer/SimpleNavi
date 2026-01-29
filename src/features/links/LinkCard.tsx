import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Link, ViewMode } from '@/lib/types'
import { api } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TagBadge } from './TagBadge'
import { cn } from '@/lib/utils'

interface LinkCardProps {
  link: Link
  viewMode: ViewMode
}

export function LinkCard({ link, viewMode }: LinkCardProps) {
  const [imgError, setImgError] = useState(false)
  const isCompact = viewMode === 'list'

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
      className={cn(
        "group relative flex transition-all duration-300 border border-border/60 backdrop-blur-md",
        !isCompact && "items-start gap-5 rounded-xl bg-card/60 p-6 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_0_30px_-5px] hover:shadow-primary/30 dark:hover:shadow-primary/20",
        isCompact && "items-center gap-4 rounded-lg bg-card/40 p-3 hover:bg-card/80 hover:border-primary/30"
      )}
    >
      {/* Animated gradient border on hover - Grid mode only */}
      {!isCompact && (
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
      )}

      {/* Corner accent - Grid mode only */}
      {!isCompact && (
        <div className="absolute right-0 top-0 h-12 w-12 overflow-hidden rounded-tr-xl">
          <div className="absolute -right-6 -top-6 h-12 w-12 rotate-45 bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      )}

      <Avatar className={cn(
        "transition-all rounded-lg ring-2 ring-border/40",
        !isCompact && "h-14 w-14 shrink-0 group-hover:ring-primary/50 group-hover:shadow-[0_0_15px_-3px] group-hover:shadow-primary/40",
        isCompact && "h-10 w-10 shrink-0 text-sm"
      )}>
        {!imgError && (
          <AvatarImage
            src={link.icon_url || `/api/favicon?domain=${domain}`}
            alt={link.title}
            onError={() => setImgError(true)}
            className="rounded-lg"
          />
        )}
        <AvatarFallback className={cn(
          "rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 font-bold text-primary",
          !isCompact && "font-mono text-lg",
          isCompact && "text-sm font-mono"
        )}>
          {initial}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex-1 min-w-0", isCompact ? "flex flex-col justify-center" : "pt-1")}>
        <div className={cn(
          "min-w-0",
          isCompact ? "space-y-0.5" : "flex-1"
        )}>
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary truncate",
              isCompact && "text-sm"
            )}>
              {link.title}
            </span>
            {!isCompact && (
              <ExternalLink className="shrink-0 h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary opacity-0 -translate-x-2 group-hover:opacity-80 group-hover:translate-x-0" />
            )}
          </div>
          {isCompact && (
            <span className="text-xs text-muted-foreground font-mono truncate">
              {domain}
            </span>
          )}
          {!isCompact && link.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {link.description}
            </p>
          )}
        </div>

        {!isCompact && (
          <div className="mt-3 text-muted-foreground/60 font-mono text-xs">
            <span className="truncate">{domain}</span>
            {link.tags && link.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {link.tags.map((tag) => (
                  <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom glow line - Grid mode only */}
      {!isCompact && (
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </a>
  )
}
