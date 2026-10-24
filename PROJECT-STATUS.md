# Portfolio project: status on 2026-10-16

School assignment: professional online portfolio with Figma design, website and backoffice.
Read this file first when continuing the work in a new conversation.

## Links

| What | Where |
|---|---|
| Live website | https://portefolio-neon-phi.vercel.app |
| Backoffice | https://portefolio-neon-phi.vercel.app/admin (log in with the user created in Supabase > Authentication > Users) |
| Source code | https://github.com/Kroketez/portefolio (branch `main`) |
| Figma file | https://www.figma.com/design/FYAD8YzqHI2BbsQfKwz95v |
| Figma prototype | Figma > page "3. Design UI + Protótipo" > Present. Flows: Website público, Backoffice, Mobile, Dark mode |

## Accounts and services

| Service | Details |
|---|---|
| Supabase | Project "Kroketez's Project", ref `vpotqgallcsnlehsvszu`, region eu-west-1, free plan. Sign-ups are closed: only the owner's account exists. |
| Vercel | Account "kroketez", project "portefolio". Root Directory `portfolio`, framework Vite. Settings `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set for all environments. |
| GitHub | Account "Kroketez". The Vercel GitHub app is installed, so every push to `main` publishes the site automatically. |
| Brevo | Account "Kroketez". API key stored only as the Supabase secret `BREVO_API_KEY` (never in the code). Sender and recipient emails stored as `BREVO_SENDER_EMAIL` and `CONTACT_TO_EMAIL`. IP blocking for API keys is off, which the contact function needs. |

## Where things are in this folder

| Folder / file | Content |
|---|---|
| `portfolio/` | Website code (Vite + React + TypeScript). Setup notes in `portfolio/README.md`. |
| `portfolio/supabase/schema.sql` | Database tables, access rules, storage and placeholder content (already applied). |
| `portfolio/supabase/functions/contact/index.ts` | Contact form function: validates, saves the message, sends the email through Brevo (deployed as `contact`). |
| `figma/` | HTML files used to generate the Figma frames. |

## Running the site on this computer

In a terminal inside `portfolio`: `npm run dev`, then open http://localhost:5180.
`portfolio/.env` (not on GitHub) holds the Supabase address and public key; recreate it from `.env.example` on another computer.
Node.js was installed with winget; if `npm` is not found, open a new terminal.

## Publishing changes

Push to `main` on GitHub and Vercel rebuilds the site within a minute or two.

## Done (all tested)

- Phase 1, Figma: information architecture, 8 wireframes, 18 UI frames (public site, backoffice, English, dark mode, mobile, style guide), prototype with 4 flows; all links checked, none broken.
- Phase 2, website: Home, Sobre mim, Projetos (search and filters), project page, CV (online and PDF download), Contacto (validation, feedback, Brevo email). PT and EN, dark mode, responsive, SEO titles, visit statistics.
- Phase 3, backoffice: login, session, logout, dashboard, projects, contents, skills, experience, messages, statistics. Delete buttons ask for a second click.
- Security checked as an anonymous visitor: cannot read messages or statistics, cannot change content, cannot write to the database directly.
- Live site tested on 2026-10-16: contact form email arrived, backoffice login and Contactos work.

## Still to do

1. Add the real content in the backoffice (Conteúdos, Competências, Experiência e formação, Projetos; PT and EN; photo; CV PDF). The site currently shows placeholder text and six example projects.
2. After that, update the Figma screens to match the real content.
3. Submit to Moodle:
   - Figma: share link (Share > "Anyone with the link" > can view) or a `.fig` file (File > Save local copy).
   - Information architecture, wireframes and prototype: pages 1, 2 and 3 of the Figma file (can be exported as PDF).
   - Source code: the GitHub link (or a zip without `node_modules` and `.env`).
   - Working website: the Vercel link.

## Known limits

- The backoffice interface is in Portuguese only.
- Free Supabase projects pause after about a week without visits: open the site a day before it is graded.
- Prototype links react only when clicking directly on the text.
- Supabase suggests turning on "leaked password protection" (Authentication settings); optional.
