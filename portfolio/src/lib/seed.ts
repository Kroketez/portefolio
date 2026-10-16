import type { ContentRow, Experience, Project, Skill, TableMap } from './types'

// Placeholder content used in demo mode. The same placeholders are inserted by
// supabase/schema.sql, so a fresh Supabase project looks identical.
const content: ContentRow[] = [
  { key: 'name', pt: 'Nome Apelido', en: '' },
  { key: 'hero_title', pt: 'Título profissional', en: 'Professional title' },
  {
    key: 'hero_intro',
    pt: 'Frase curta de apresentação: o que fazes, para quem e o que te distingue. Duas linhas no máximo.',
    en: 'Short introduction: what you do, who you do it for and what sets you apart. Two lines at most.',
  },
  { key: 'photo_url', pt: '', en: '' },
  { key: 'stat1_value', pt: '00', en: '' },
  { key: 'stat1_label', pt: 'Projetos concluídos', en: 'Projects completed' },
  { key: 'stat2_value', pt: '0+', en: '' },
  { key: 'stat2_label', pt: 'Anos de experiência', en: 'Years of experience' },
  { key: 'cta_title', pt: 'Vamos trabalhar juntos?', en: 'Shall we work together?' },
  {
    key: 'cta_text',
    pt: 'Estou disponível para novos projetos, estágios e oportunidades.',
    en: 'I am available for new projects, internships and opportunities.',
  },
  { key: 'about_heading', pt: 'Título de apresentação pessoal', en: 'Personal introduction title' },
  {
    key: 'about_short',
    pt: 'Parágrafo de resumo sobre o teu percurso, a tua forma de trabalhar e aquilo que procuras.',
    en: 'Summary paragraph about your background, the way you work and what you are looking for.',
  },
  {
    key: 'about_bio',
    pt: 'Primeiro parágrafo da biografia: quem és, de onde vens e o que fazes profissionalmente.\n\nSegundo parágrafo: o teu percurso, aquilo em que te especializaste e o tipo de projetos que mais gostas de desenvolver.',
    en: 'First paragraph of the biography: who you are, where you come from and what you do professionally.\n\nSecond paragraph: your path, what you specialised in and the kind of projects you most enjoy building.',
  },
  {
    key: 'cv_summary',
    pt: 'Resumo profissional em três ou quatro linhas: experiência, áreas de especialização e objetivos.',
    en: 'Professional summary in three or four lines: experience, areas of expertise and goals.',
  },
  { key: 'languages', pt: 'Português — Nativo\nInglês — Nível', en: 'Portuguese — Native\nEnglish — Level' },
  { key: 'cv_pdf_url', pt: '', en: '' },
  { key: 'email', pt: 'nome@email.com', en: '' },
  { key: 'phone', pt: '+351 000 000 000', en: '' },
  { key: 'location', pt: 'Cidade, Portugal', en: 'City, Portugal' },
  { key: 'linkedin', pt: '', en: '' },
  { key: 'github', pt: '', en: '' },
  { key: 'behance', pt: '', en: '' },
  { key: 'seo_title', pt: 'Nome Apelido — Portefólio', en: 'Name Surname — Portfolio' },
  {
    key: 'seo_description',
    pt: 'Portefólio profissional: perfil, competências, experiência e projetos.',
    en: 'Professional portfolio: profile, skills, experience and projects.',
  },
]

const categories = ['Categoria A', 'Categoria B', 'Categoria C']
const techs = [
  ['Tecnologia 1', 'Tecnologia 2'],
  ['Tecnologia 2', 'Tecnologia 3'],
  ['Tecnologia 1', 'Tecnologia 3'],
]

const projects: Project[] = Array.from({ length: 6 }, (_, i) => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`,
  slug: `projeto-${i + 1}`,
  title_pt: `Título do projeto ${i + 1}`,
  title_en: `Project title ${i + 1}`,
  summary_pt: 'Resumo do projeto numa ou duas linhas de texto.',
  summary_en: 'Project summary in one or two lines of text.',
  challenge_pt: 'Descrição do problema ou objetivo do projeto.',
  challenge_en: 'Description of the problem or goal of the project.',
  solution_pt: 'Descrição da abordagem, das decisões tomadas e do resultado final.',
  solution_en: 'Description of the approach, the decisions made and the final result.',
  category: categories[i % 3],
  technologies: techs[i % 3],
  client: 'Nome do cliente',
  year: 2026,
  role_pt: 'A tua função',
  role_en: 'Your role',
  cover_url: '',
  gallery: [],
  live_url: '',
  repo_url: '',
  featured: i < 3,
  published: true,
  sort: i,
  created_at: new Date(Date.UTC(2026, 0, 6 - i)).toISOString(),
}))

const skills: Skill[] = ['A', 'B', 'C'].flatMap((g, gi) =>
  [1, 2, 3, 4].map((n) => ({
    id: `00000000-0000-4000-8000-0000000001${gi}${n}`,
    group_pt: `Grupo de competências ${g}`,
    group_en: `Skill group ${g}`,
    name: `Competência ${g}${n}`,
    sort: gi * 10 + n,
  })),
)

const experience: Experience[] = [
  ...[1, 2, 3].map((n) => ({
    id: `00000000-0000-4000-8000-00000000020${n}`,
    kind: 'work' as const,
    title_pt: 'Cargo',
    title_en: 'Job title',
    org: 'Empresa',
    location: 'Local',
    period: n === 1 ? 'Ano — Presente' : 'Ano — Ano',
    description_pt: 'Descrição das principais responsabilidades e resultados.',
    description_en: 'Description of the main responsibilities and results.',
    sort: n,
  })),
  ...[1, 2].map((n) => ({
    id: `00000000-0000-4000-8000-00000000030${n}`,
    kind: 'education' as const,
    title_pt: 'Curso',
    title_en: 'Course',
    org: 'Instituição',
    location: '',
    period: 'Ano — Ano',
    description_pt: 'Nota sobre o curso ou áreas principais.',
    description_en: 'Note about the course or main subjects.',
    sort: n,
  })),
]

export const seed: { [T in keyof TableMap]: TableMap[T][] } = {
  content,
  projects,
  skills,
  experience,
  messages: [],
  page_views: [],
}
