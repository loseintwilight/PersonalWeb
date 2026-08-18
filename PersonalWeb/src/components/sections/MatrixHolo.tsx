import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '@/types'
import { getPosts } from '@/utils/content'
import { formatDate } from '@/utils/format'
import { Icon } from '@/components/ui/Icon'
import { CountUp } from '@/components/animation/CountUp'
import { cn } from '@/utils/cn'
import { useInView } from '@/hooks/useInView'

/** 每页展示的文章条数（第 2 行主内容区） */
const POSTS_PER_PAGE = 2
/** 标签云最多展示的标签数 */
const TAG_CLOUD_MAX = 14
/** 联系邮箱（与 About 页保持一致，可替换为真实邮箱） */
const CONTACT_MAIL = 'hello@example.com'

/* 访问统计（本地 localStorage 计数，接入真实统计服务后替换） */
const VISIT_TOTAL_KEY = 'harbor.visits.total.v1'
const VISIT_DAY_KEY = 'harbor.visits.day.v1'
const VISIT_SESSION_KEY = 'harbor.visits.session.v1'

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* 隐私模式等场景下忽略 */
  }
}

function useVisitStats(): { total: number; today: number } {
  const [stats, setStats] = useState({ total: 0, today: 0 })

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const sessionSeen = readStorage(VISIT_SESSION_KEY) === '1'
    const total = (Number(readStorage(VISIT_TOTAL_KEY)) || 0) + (sessionSeen ? 0 : 1)
    let day: { date: string; count: number } = { date: '', count: 0 }
    try {
      const raw = localStorage.getItem(VISIT_DAY_KEY)
      if (raw) day = JSON.parse(raw) as { date: string; count: number }
    } catch {
      /* ignore */
    }
    const todayCount = day.date === today ? day.count + (sessionSeen ? 0 : 1) : 1
    if (!sessionSeen) {
      writeStorage(VISIT_TOTAL_KEY, String(total))
      writeStorage(VISIT_SESSION_KEY, '1')
    }
    writeStorage(VISIT_DAY_KEY, JSON.stringify({ date: today, count: todayCount }))
    setStats({ total, today: todayCount })
  }, [])

  return stats
}

/** 摘要兜底：无 frontmatter summary 时从正文提取纯文本 */
function plainSummary(post: Post): string {
  if (post.summary) return post.summary
  const text = post.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*`~\-\[\]()!|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 62 ? `${text.slice(0, 62)}…` : text
}

interface MatrixHoloProps {
  /** 移动端 / reduced-motion 时降级为静态矩阵（无入场动画） */
  staticMode?: boolean
}

interface MatrixCardProps {
  kicker: string
  title: string
  accent?: string
  className?: string
  children: ReactNode
}

/** 卡片外壳：大写英文小标题 + 中文标题层级；文字先于矩形入场 */
function MatrixCard({ kicker, title, accent = '#7fd8ff', className, children }: MatrixCardProps) {
  /** 悬停弧形光斑跟随鼠标（--mx / --my，配合 ::before 的 mix-blend-mode: difference） */
  const handleCardMove = (e: ReactMouseEvent<HTMLElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 100
    const my = ((e.clientY - rect.top) / rect.height) * 100
    e.currentTarget.style.setProperty('--mx', `${mx.toFixed(2)}%`)
    e.currentTarget.style.setProperty('--my', `${my.toFixed(2)}%`)
  }

  return (
    <article
      onMouseMove={handleCardMove}
      className={cn('matrix-card', className)}
      style={{ '--card-accent': accent, '--mx': '50%', '--my': '50%' } as CSSProperties}
    >
      <div className="matrix-card__panel" aria-hidden="true" />
      <div className="matrix-card__body">
        <header className="matrix-card__head">
          <p className="matrix-card__kicker">{kicker}</p>
          <h3 className="matrix-card__title">{title}</h3>
        </header>
        <div className="matrix-card__content">{children}</div>
      </div>
    </article>
  )
}

/** 文章列表 + 分页圆点（每页固定展示 POSTS_PER_PAGE 篇） */
function PostSlider({ posts, empty }: { posts: Post[]; empty: string }) {
  const [page, setPage] = useState(0)
  const pages = useMemo(() => {
    const groups: Post[][] = []
    for (let i = 0; i < posts.length; i += POSTS_PER_PAGE) groups.push(posts.slice(i, i + POSTS_PER_PAGE))
    return groups
  }, [posts])

  useEffect(() => {
    setPage(0)
  }, [posts.length])

  if (posts.length === 0) {
    return <p className="matrix-empty">{empty}</p>
  }

  const current = pages[Math.min(page, pages.length - 1)] ?? []
  return (
    <div className="matrix-posts">
      <div className="matrix-posts__list" key={page}>
        {current.map((post) => (
          <Link key={post.slug} to={`/log/${post.slug}`} className="matrix-post">
            <span className="matrix-post__meta">
              <span className="matrix-post__cat">{post.category}</span>
              <span className="matrix-post__date">{formatDate(post.date)}</span>
            </span>
            <span className="matrix-post__title">{post.title}</span>
            <span className="matrix-post__summary">{plainSummary(post)}</span>
          </Link>
        ))}
      </div>
      {pages.length > 1 && (
        <div className="matrix-posts__dots" role="group" aria-label="分页切换">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn('matrix-posts__dot', i === page && 'is-active')}
              onClick={() => setPage(i)}
              aria-label={`第 ${i + 1} 页`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 首页下拉 · 规整三段式矩阵（2 / 2 / 3 等宽行列）：
 * - 第 1 行：站点访问数据 + 文章档案统计
 * - 第 2 行（主内容区）：置顶文章 + 最新更新（分类 / 日期 / 标题 / 摘要 + 分页圆点）
 * - 第 3 行：分类索引 + 标签索引 + 订阅与联系
 * 文字先于矩形入场；移动端全部堆叠为单列。
 */
export function MatrixHolo({ staticMode = false }: MatrixHoloProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3)
  const visits = useVisitStats()

  const posts = useMemo(() => getPosts(), [])
  const pinned = useMemo(() => posts.slice(0, POSTS_PER_PAGE), [posts])
  const latest = useMemo(() => posts.slice(POSTS_PER_PAGE), [posts])

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of posts) map.set(post.category, (map.get(post.category) ?? 0) + 1)
    return Array.from(map, ([name, count]) => ({ name, count }))
  }, [posts])

  const tags = useMemo(() => {
    const map = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags) map.set(tag, (map.get(tag) ?? 0) + 1)
    }
    return Array.from(map, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  }, [posts])
  const tagCloud = tags.slice(0, TAG_CLOUD_MAX)
  const maxTagCount = tags[0]?.count ?? 1

  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const onSubscribe = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
  }

  const countVisible = inView || staticMode

  return (
    <div
      ref={ref}
      className={cn('matrix-space', inView && 'is-in', staticMode && 'is-static')}
      aria-label="站点信息矩阵"
    >
      {/* —— 第 1 行：站点数据 + 档案统计（2 列等宽） —— */}
      <div className="matrix-row matrix-row--2">
        <MatrixCard kicker="VISITS" title="站点访问数据" accent="#2ee6c8">
          <p className="matrix-live">
            <i className="matrix-live__dot" />
            SYS.ONLINE
          </p>
          <div className="matrix-stats">
            <div className="matrix-stat">
              {countVisible ? <CountUp value={visits.total} className="matrix-stat__value" /> : <span className="matrix-stat__value">0</span>}
              <span className="matrix-stat__label">累计访问</span>
            </div>
            <div className="matrix-stat">
              {countVisible ? <CountUp value={visits.today} className="matrix-stat__value" /> : <span className="matrix-stat__value">0</span>}
              <span className="matrix-stat__label">今日访问</span>
            </div>
          </div>
        </MatrixCard>

        <MatrixCard kicker="ARCHIVE" title="文章档案统计" accent="#a78bfa">
          <div className="matrix-stats matrix-stats--3">
            <div className="matrix-stat">
              {countVisible ? <CountUp value={posts.length} className="matrix-stat__value" /> : <span className="matrix-stat__value">0</span>}
              <span className="matrix-stat__label">文章</span>
            </div>
            <div className="matrix-stat">
              {countVisible ? <CountUp value={categories.length} className="matrix-stat__value" /> : <span className="matrix-stat__value">0</span>}
              <span className="matrix-stat__label">分类</span>
            </div>
            <div className="matrix-stat">
              {countVisible ? <CountUp value={tags.length} className="matrix-stat__value" /> : <span className="matrix-stat__value">0</span>}
              <span className="matrix-stat__label">标签</span>
            </div>
          </div>
          <Link className="matrix-more" to="/log/archive">
            进入归档
            <Icon name="arrow-right" size={14} />
          </Link>
        </MatrixCard>
      </div>

      {/* —— 第 2 行：主内容区，置顶 + 最新（2 列等宽，行内等高） —— */}
      <div className="matrix-row matrix-row--2 matrix-row--main">
        <MatrixCard kicker="PINNED" title="置顶文章" accent="#7fd8ff">
          <PostSlider posts={pinned} empty="暂无置顶文章" />
        </MatrixCard>
        <MatrixCard kicker="UPDATES" title="最新更新" accent="#60a5fa">
          <PostSlider posts={latest} empty="暂无最新更新" />
        </MatrixCard>
      </div>

      {/* —— 第 3 行：分类 / 标签 / 订阅（3 列等宽） —— */}
      <div className="matrix-row matrix-row--3">
        <MatrixCard kicker="CATEGORIES" title="分类索引" accent="#38bdf8">
          <ul className="matrix-list">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link className="matrix-list__row" to={`/log?cat=${encodeURIComponent(cat.name)}`}>
                  <span className="matrix-list__name">{cat.name}</span>
                  <span className="matrix-list__count">{cat.count}</span>
                  <Icon name="arrow-right" size={13} />
                </Link>
              </li>
            ))}
          </ul>
        </MatrixCard>

        <MatrixCard kicker="TAGS" title="标签索引" accent="#818cf8">
          <div className="matrix-tags">
            {tagCloud.map((tag) => (
              <span
                key={tag.name}
                className="matrix-tags__chip"
                style={{ '--ts': `${0.7 + (tag.count / maxTagCount) * 0.32}rem` } as CSSProperties}
              >
                {tag.name}
                <b>{tag.count}</b>
              </span>
            ))}
          </div>
          <Link className="matrix-more" to="/log/archive">
            浏览全部
            <Icon name="arrow-right" size={14} />
          </Link>
        </MatrixCard>

        <MatrixCard kicker="SUBSCRIBE" title="订阅与联系" accent="#2ee6c8">
          <form className="matrix-sub" onSubmit={onSubscribe}>
            <label className="matrix-sub__label" htmlFor="matrix-email">
              输入邮箱，第一时间收到新航程推送
            </label>
            <div className="matrix-sub__row">
              <input
                id="matrix-email"
                className="matrix-sub__input"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="matrix-sub__btn">
                订阅
              </button>
            </div>
            <p className={cn('matrix-sub__state', subscribed && 'is-ok')}>
              {subscribed ? '已订阅，感谢同行 ✦' : '仅供通知，绝不打扰'}
            </p>
          </form>
          <div className="matrix-contacts">
            <a href={`mailto:${CONTACT_MAIL}`} className="matrix-contacts__item">
              <Icon name="mail" size={14} />
              联系我
            </a>
            <Link to="/about/links" className="matrix-contacts__item">
              <Icon name="link" size={14} />
              交换友链
            </Link>
          </div>
        </MatrixCard>
      </div>
    </div>
  )
}
