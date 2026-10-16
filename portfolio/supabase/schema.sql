-- Portfolio database. Run this whole file once in the Supabase SQL editor
-- (Dashboard > SQL Editor > New query > paste > Run).
--
-- Access rules (row level security):
--   visitors (anon)   read site content and PUBLISHED projects; add page views
--   admin (logged in) full access to everything
--   contact messages  can only be inserted by the "contact" edge function
--
-- This setup assumes ONE admin: every logged-in user has full access, so
-- disable public sign-ups in Authentication > Sign In / Providers and create
-- your own user in Authentication > Users.

create extension if not exists pgcrypto;

create table if not exists content (
  key text primary key,
  pt text not null default '',
  en text not null default ''
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_pt text not null default '',
  title_en text not null default '',
  summary_pt text not null default '',
  summary_en text not null default '',
  challenge_pt text not null default '',
  challenge_en text not null default '',
  solution_pt text not null default '',
  solution_en text not null default '',
  category text not null default '',
  technologies text[] not null default '{}',
  client text not null default '',
  year int,
  role_pt text not null default '',
  role_en text not null default '',
  cover_url text not null default '',
  gallery text[] not null default '{}',
  live_url text not null default '',
  repo_url text not null default '',
  featured boolean not null default false,
  published boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  group_pt text not null default '',
  group_en text not null default '',
  name text not null default '',
  sort int not null default 0
);

create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'work' check (kind in ('work', 'education')),
  title_pt text not null default '',
  title_en text not null default '',
  org text not null default '',
  location text not null default '',
  period text not null default '',
  description_pt text not null default '',
  description_en text not null default '',
  sort int not null default 0
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) <= 200),
  kind text not null default 'view' check (kind in ('view', 'cv_download')),
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at on page_views (created_at);

-- ---------- row level security ----------

alter table content enable row level security;
alter table projects enable row level security;
alter table skills enable row level security;
alter table experience enable row level security;
alter table messages enable row level security;
alter table page_views enable row level security;

grant select on content, skills, experience, projects to anon;
grant insert on page_views to anon;
grant all on content, projects, skills, experience, messages, page_views to authenticated;
grant all on messages to service_role;

create policy "public read content" on content for select to anon using (true);
create policy "public read skills" on skills for select to anon using (true);
create policy "public read experience" on experience for select to anon using (true);
create policy "public read published projects" on projects for select to anon using (published);
create policy "public add page views" on page_views for insert with check (true);

create policy "admin all content" on content for all to authenticated using (true) with check (true);
create policy "admin all projects" on projects for all to authenticated using (true) with check (true);
create policy "admin all skills" on skills for all to authenticated using (true) with check (true);
create policy "admin all experience" on experience for all to authenticated using (true) with check (true);
create policy "admin all messages" on messages for all to authenticated using (true) with check (true);
create policy "admin read page views" on page_views for select to authenticated using (true);

-- ---------- file storage (project images, photo, CV PDF) ----------

insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;

create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "admin upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "admin update media" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id = 'media');

-- ---------- placeholder content (replace it in the backoffice) ----------

insert into content (key, pt, en) values
  ('name', 'Nome Apelido', ''),
  ('hero_title', 'Título profissional', 'Professional title'),
  ('hero_intro', 'Frase curta de apresentação: o que fazes, para quem e o que te distingue.', 'Short introduction: what you do, who you do it for and what sets you apart.'),
  ('stat1_value', '00', ''),
  ('stat1_label', 'Projetos concluídos', 'Projects completed'),
  ('stat2_value', '0+', ''),
  ('stat2_label', 'Anos de experiência', 'Years of experience'),
  ('cta_title', 'Vamos trabalhar juntos?', 'Shall we work together?'),
  ('cta_text', 'Estou disponível para novos projetos, estágios e oportunidades.', 'I am available for new projects, internships and opportunities.'),
  ('about_heading', 'Título de apresentação pessoal', 'Personal introduction title'),
  ('about_short', 'Parágrafo de resumo sobre o teu percurso e aquilo que procuras.', 'Summary paragraph about your background and what you are looking for.'),
  ('about_bio', 'Primeiro parágrafo da biografia.' || chr(10) || chr(10) || 'Segundo parágrafo da biografia.', 'First paragraph of the biography.' || chr(10) || chr(10) || 'Second paragraph of the biography.'),
  ('cv_summary', 'Resumo profissional em três ou quatro linhas.', 'Professional summary in three or four lines.'),
  ('languages', 'Português — Nativo' || chr(10) || 'Inglês — Nível', 'Portuguese — Native' || chr(10) || 'English — Level'),
  ('email', 'nome@email.com', ''),
  ('phone', '+351 000 000 000', ''),
  ('location', 'Cidade, Portugal', 'City, Portugal'),
  ('seo_title', 'Nome Apelido — Portefólio', 'Name Surname — Portfolio'),
  ('seo_description', 'Portefólio profissional: perfil, competências, experiência e projetos.', 'Professional portfolio: profile, skills, experience and projects.')
on conflict (key) do nothing;

insert into projects (slug, title_pt, title_en, summary_pt, summary_en, challenge_pt, challenge_en, solution_pt, solution_en, category, technologies, client, year, role_pt, role_en, featured, published, sort)
select
  'projeto-' || n,
  'Título do projeto ' || n,
  'Project title ' || n,
  'Resumo do projeto numa ou duas linhas de texto.',
  'Project summary in one or two lines of text.',
  'Descrição do problema ou objetivo do projeto.',
  'Description of the problem or goal of the project.',
  'Descrição da abordagem e do resultado final.',
  'Description of the approach and the final result.',
  'Categoria ' || chr(64 + ((n - 1) % 3) + 1),
  array['Tecnologia ' || (((n - 1) % 3) + 1), 'Tecnologia ' || ((n % 3) + 1)],
  'Nome do cliente', 2026, 'A tua função', 'Your role',
  n <= 3, true, n
from generate_series(1, 6) as n
on conflict (slug) do nothing;

insert into skills (group_pt, group_en, name, sort)
select 'Grupo de competências ' || chr(64 + g), 'Skill group ' || chr(64 + g), 'Competência ' || chr(64 + g) || n, g * 10 + n
from generate_series(1, 3) as g, generate_series(1, 4) as n
where not exists (select 1 from skills);

insert into experience (kind, title_pt, title_en, org, location, period, description_pt, description_en, sort)
select * from (values
  ('work', 'Cargo', 'Job title', 'Empresa', 'Local', 'Ano — Presente', 'Descrição das principais responsabilidades e resultados.', 'Description of the main responsibilities and results.', 1),
  ('work', 'Cargo', 'Job title', 'Empresa', 'Local', 'Ano — Ano', 'Descrição das principais responsabilidades e resultados.', 'Description of the main responsibilities and results.', 2),
  ('education', 'Curso', 'Course', 'Instituição', '', 'Ano — Ano', 'Nota sobre o curso ou áreas principais.', 'Note about the course or main subjects.', 3)
) as seed
where not exists (select 1 from experience);
