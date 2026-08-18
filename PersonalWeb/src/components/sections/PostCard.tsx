import { Link } from 'react-router-dom'
import type { Post } from '@/types'
import { formatDate, voyageDayLabel } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/animation/Reveal'

export function PostCard({ post, delay = 0 }: { post: Post; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Card hover className="flex h-full flex-col p-6">
        <Link to={`/log/${post.slug}`} className="group flex flex-1 flex-col">
          <div className="flex items-center gap-2 text-xs text-[var(--ink-3)]">
            <Icon name="calendar" size={13} />
            <span>{formatDate(post.date)}</span>
            <span className="opacity-60">·</span>
            <span>{voyageDayLabel(post.date)}</span>
          </div>
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--accent)]">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink-2)]">{post.summary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2">
            <Badge>{post.category}</Badge>
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            <span className="ml-auto flex items-center gap-1 text-xs text-[var(--ink-3)]">
              <Icon name="clock" size={13} />
              {post.readingMinutes} 分钟
            </span>
          </div>
        </Link>
      </Card>
    </Reveal>
  )
}