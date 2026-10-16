export type Lang = 'pt' | 'en'

export interface Project {
  id: string
  slug: string
  title_pt: string
  title_en: string
  summary_pt: string
  summary_en: string
  challenge_pt: string
  challenge_en: string
  solution_pt: string
  solution_en: string
  category: string
  technologies: string[]
  client: string
  year: number | null
  role_pt: string
  role_en: string
  cover_url: string
  gallery: string[]
  live_url: string
  repo_url: string
  featured: boolean
  published: boolean
  sort: number
  created_at: string
}

export interface Skill {
  id: string
  group_pt: string
  group_en: string
  name: string
  sort: number
}

export interface Experience {
  id: string
  kind: 'work' | 'education'
  title_pt: string
  title_en: string
  org: string
  location: string
  period: string
  description_pt: string
  description_en: string
  sort: number
}

export interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export interface PageView {
  id: string
  path: string
  kind: 'view' | 'cv_download'
  created_at: string
}

export interface ContentRow {
  key: string
  pt: string
  en: string
}

export interface TableMap {
  projects: Project
  skills: Skill
  experience: Experience
  messages: Message
  page_views: PageView
  content: ContentRow
}

export type Table = keyof TableMap
