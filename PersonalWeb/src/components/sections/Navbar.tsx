import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

interface NavItemDef {
  to: string
  text: string
  icon: 'star' | 'route' | 'flag' | 'archive' | 'sparkles' | 'heart' | 'link'
}

interface NavGroupDef {
  label: string
  icon: 'anchor' | 'compass' | 'user'
  items: NavItemDef[]
}

const GROUPS: NavGroupDef[] = [
  {
    label: '航海日志',
    icon: 'anchor',
    items: [
      { to: '/log', text: '全部日志', icon: 'star' },
      { to: '/log?cat=技术航路', text: '技术航路', icon: 'route' },
      { to: '/log?cat=生活随记', text: '生活随记', icon: 'flag' },
      { to: '/log/archive', text: '归档海图', icon: 'archive' },
    ],
  },
  {
    label: '星图',
    icon: 'compass',
    items: [
      { to: '/chart', text: '全部项目', icon: 'star' },
      { to: '/chart?cat=开源项目', text: '开源项目', icon: 'route' },
      { to: '/chart?cat=创意工坊', text: '创意工坊', icon: 'sparkles' },
    ],
  },
  {
    label: '关于',
    icon: 'user',
    items: [
      { to: '/about', text: '关于我', icon: 'heart' },
      { to: '/about/links', text: '友链', icon: 'link' },
    ],
  },
]

function itemActive(item: NavItemDef, pathname: string): boolean {
  const target = item.to.split('?')[0]
  if (item.to.startsWith('/log')) return pathname.startsWith('/log')
  if (item.to.startsWith('/chart')) return pathname.startsWith('/chart')
  if (item.to.startsWith('/about')) return pathname.startsWith('/about')
  return pathname === target
}

function groupActive(group: NavGroupDef, pathname: string): boolean {
  return group.items.some((item) => itemActive(item, pathname))
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [highlight, setHighlight] = useState<{ left: number; width: number } | null>(null)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [hovering, setHovering] = useState(false)
  const centerRef = useRef<HTMLElement | null>(null)
  const { season, weather } = useTheme()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const highlightFor = (el: HTMLElement) => {
    const parent = centerRef.current
    if (!parent) return
    setHighlight({ left: el.offsetLeft, width: el.offsetWidth })
  }

  const onCenterMouseLeave = () => setHovering(false)

  const onItemEnter = (e: MouseEvent<HTMLElement>) => {
    setHovering(true)
    highlightFor(e.currentTarget)
  }

  return (
    <header className={cn('navbar-root', scrolled && 'scrolled')}>
      <div className="navbar-bar">
        {/* 左段：头像 + 名字 */}
        <Link to="/" className="navbar-brand" aria-label="回到港湾">
          <img src="/avatar.jpg" alt="Loseintwilight" className="navbar-brand-avatar" />
          <span className="navbar-brand-text">
            <span className="navbar-brand-title">Loseintwilight</span>
            <span className="navbar-brand-sub">启航 · HARBOR</span>
          </span>
        </Link>

        {/* 中段：桌面导航 */}
        <nav
          ref={centerRef}
          className={cn('navbar-center hidden lg:flex', (hovering || highlight) && 'has-hover')}
          aria-label="主导航"
          onMouseLeave={onCenterMouseLeave}
        >
          <span className="nav-highlight" style={highlight ? { left: highlight.left, width: highlight.width } : undefined} />
          <NavLink to="/" end onMouseEnter={onItemEnter} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
            <Icon name="home" size={16} />
            港湾
          </NavLink>
          {GROUPS.map((group) => (
            <div
              key={group.label}
              className={cn('nav-group relative', openGroup === group.label && 'is-dropdown-open')}
              onMouseEnter={onItemEnter}
              onMouseLeave={() => setOpenGroup((v) => (v === group.label ? null : v))}
            >
              <span
                className={cn('nav-item', groupActive(group, pathname) && 'active')}
                tabIndex={0}
                role="button"
                aria-expanded={openGroup === group.label}
                onClick={() => setOpenGroup((v) => (v === group.label ? null : group.label))}
              >
                <Icon name={group.icon} size={16} />
                {group.label}
                <Icon name="arrow-down" size={12} className="chev" />
              </span>
              <div className={cn('nav-dropdown', openGroup === group.label && 'open')}>
                {group.items.map((item) => (
                  <Link key={item.to} to={item.to} className={cn('dropdown-item', itemActive(item, pathname) && 'active')}>
                    <Icon name={item.icon} size={16} className="dicon" />
                    {item.text}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <NavLink to="/wake" onMouseEnter={onItemEnter} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
            <Icon name="wave" size={16} />
            航迹
          </NavLink>
          <NavLink to="/bottle" onMouseEnter={onItemEnter} className={({ isActive }) => cn('nav-item', isActive && 'active')}>
            <Icon name="message" size={16} />
            漂流瓶
          </NavLink>
        </nav>

        {/* 右段 */}
        <div className="navbar-right">
          <span className="nav-theme-chip hidden md:inline-flex" title="季节 · 天气">
            <span>{season === 'spring' ? '🌸' : season === 'summer' ? '☀️' : season === 'autumn' ? '🍂' : '❄️'}</span>
            <span className="opacity-70">{weather === 'sunny' ? '晴' : weather === 'cloudy' ? '多云' : weather === 'rain' ? '下雨' : '雪'}</span>
          </span>
          <button className="nav-icon-btn lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="菜单">
            <Icon name={mobileOpen ? 'x' : 'menu'} size={18} />
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileOpen && (
        <nav className="mobile-nav lg:hidden" aria-label="移动端导航">
          <MobileLink to="/" label="港湾" icon="home" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/log" label="航海日志" icon="anchor" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/log/archive" label="归档海图" icon="archive" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/chart" label="星图" icon="compass" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/wake" label="航迹" icon="wave" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/about" label="关于我" icon="user" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/about/links" label="友链" icon="link" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/bottle" label="漂流瓶" icon="message" onClick={() => setMobileOpen(false)} />
        </nav>
      )}
    </header>
  )
}

function MobileLink({ to, label, icon, onClick }: { to: string; label: string; icon: 'home' | 'anchor' | 'archive' | 'compass' | 'wave' | 'user' | 'link' | 'message'; onClick: () => void }) {
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]', isActive && 'text-[var(--accent)]')}>
      <Icon name={icon} size={17} />
      {label}
    </NavLink>
  )
}