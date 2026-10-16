// Every editable text of the public site. The backoffice "Conteúdos" page is
// generated from this list, so adding a key here makes it editable there.
export interface ContentKey {
  key: string
  label: string
  group: 'Home' | 'Sobre mim' | 'CV' | 'Contactos e redes' | 'SEO'
  bilingual?: boolean
  multiline?: boolean
  upload?: 'image' | 'pdf'
}

export const contentKeys: ContentKey[] = [
  { key: 'name', label: 'Nome', group: 'Home' },
  { key: 'hero_title', label: 'Título profissional', group: 'Home', bilingual: true },
  { key: 'hero_intro', label: 'Frase de apresentação', group: 'Home', bilingual: true, multiline: true },
  { key: 'photo_url', label: 'Fotografia', group: 'Home', upload: 'image' },
  { key: 'stat1_value', label: 'Indicador 1 (valor)', group: 'Home' },
  { key: 'stat1_label', label: 'Indicador 1 (legenda)', group: 'Home', bilingual: true },
  { key: 'stat2_value', label: 'Indicador 2 (valor)', group: 'Home' },
  { key: 'stat2_label', label: 'Indicador 2 (legenda)', group: 'Home', bilingual: true },
  { key: 'cta_title', label: 'Chamada para contacto (título)', group: 'Home', bilingual: true },
  { key: 'cta_text', label: 'Chamada para contacto (texto)', group: 'Home', bilingual: true },

  { key: 'about_heading', label: 'Título da página', group: 'Sobre mim', bilingual: true },
  { key: 'about_short', label: 'Resumo (mostrado na Home)', group: 'Sobre mim', bilingual: true, multiline: true },
  { key: 'about_bio', label: 'Biografia', group: 'Sobre mim', bilingual: true, multiline: true },

  { key: 'cv_summary', label: 'Resumo profissional', group: 'CV', bilingual: true, multiline: true },
  { key: 'languages', label: 'Idiomas (um por linha)', group: 'CV', bilingual: true, multiline: true },
  { key: 'cv_pdf_url', label: 'Ficheiro PDF do CV', group: 'CV', upload: 'pdf' },

  { key: 'email', label: 'Email', group: 'Contactos e redes' },
  { key: 'phone', label: 'Telefone', group: 'Contactos e redes' },
  { key: 'location', label: 'Localização', group: 'Contactos e redes', bilingual: true },
  { key: 'linkedin', label: 'LinkedIn (URL)', group: 'Contactos e redes' },
  { key: 'github', label: 'GitHub (URL)', group: 'Contactos e redes' },
  { key: 'behance', label: 'Behance (URL)', group: 'Contactos e redes' },

  { key: 'seo_title', label: 'Título do site (motores de busca)', group: 'SEO', bilingual: true },
  { key: 'seo_description', label: 'Descrição do site', group: 'SEO', bilingual: true, multiline: true },
]

export const contentGroups = ['Home', 'Sobre mim', 'CV', 'Contactos e redes', 'SEO'] as const
