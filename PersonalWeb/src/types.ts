export type Category = '技术航路' | '生活随记'

export interface PostMeta {
  slug: string
  title: string
  date: string // ISO yyyy-MM-dd
  category: Category
  tags: string[]
  summary: string
  cover?: string
}

export interface Post extends PostMeta {
  content: string
  readingMinutes: number
}

export interface Project {
  id: string
  name: string
  description: string
  tags: string[]
  category: '开源项目' | '创意工坊'
  link?: string
  repo?: string
  year: string
  cover?: string
  featured?: boolean
}

export interface WakeItem {
  id: string
  date: string // ISO yyyy-MM-dd
  time: string
  content: string
  tags: string[]
}

export interface FriendLink {
  id: string
  name: string
  avatar: string
  description: string
  url: string
}

export interface BottleMessage {
  id: string
  nickname: string
  content: string
  date: string
}

export interface HomeCustomBlock {
  title: string
  content: string[]
  badge?: string
}

export interface ShowcaseItem {
  code: string
  image: string
  title: string
  subtitle: string
  tags: string[]
}

export interface ShowcaseConfig {
  kicker: string
  title: string
  subtitle: string
  hint?: string
  bg?: string
  items: ShowcaseItem[]
}

export type ImmersivePanelKey = 'posts' | 'projects' | 'wake' | 'days' | 'tags' | 'words'
export type ImmersivePanelIcon = 'folder' | 'star' | 'wave' | 'anchor' | 'tag' | 'compass'

export interface ImmersivePanel {
  key: ImmersivePanelKey
  icon: ImmersivePanelIcon
  label: string
  /** 点击节点后详情卡片的描述 */
  desc?: string
  /** 详情卡片跳转的内部路由 */
  link?: string
  /** 详情卡片的节点标识（HUD 风标签） */
  meta?: string
}

export interface ImmersiveFeature {
  code: string
  title: string
  subtitle: string
  desc: string
  image: string
}

export interface ImmersiveConfig {
  ocean: {
    video: string
    poster: string
    kicker: string
    title: string
    subtitle: string
  }
  panels: ImmersivePanel[]
  features: ImmersiveFeature[]
  mascot: {
    image: string
    alt: string
    name: string
    slogan: string
    tagline: string
    topBg: string
    bottomBg: string
  }
  ending: {
    video: string
    poster: string
    image: string
    title: string
    text: string
    sign: string
  }
}