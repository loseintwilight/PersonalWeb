import { Link } from 'react-router-dom'
import type { Project } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/animation/Reveal'

export function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Card hover className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--glass-bg)] border border-[var(--card-border)] text-[var(--accent)]">
            <Icon name={project.category === '开源项目' ? 'github' : 'sparkles'} size={20} />
          </div>
          <span className="text-xs text-[var(--ink-3)]">{project.year}</span>
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-[var(--ink)]">{project.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-[var(--ink-2)]">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          {project.link ? (
            <Link to={project.link} className="btn btn-ghost px-4 py-1.5 text-sm">
              <Icon name="external" size={14} />
              在线预览
            </Link>
          ) : null}
          {project.repo ? (
            <a href={project.repo} target="_blank" rel="noreferrer" className="btn btn-ghost px-4 py-1.5 text-sm">
              <Icon name="github" size={14} />
              源码
            </a>
          ) : null}
        </div>
      </Card>
    </Reveal>
  )
}