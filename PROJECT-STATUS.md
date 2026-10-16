# Portfolio project: status on 2026-10-13

School assignment: professional online portfolio with Figma design, website and backoffice.
Read this file first when continuing the work in a new conversation.

## Where everything is

| What | Where |
|---|---|
| Figma file | https://www.figma.com/design/FYAD8YzqHI2BbsQfKwz95v (pages: 1. Arquitetura da informação, 2. Wireframes, 3. Design UI + Protótipo) |
| Website code | `portfolio/` in this folder (Vite + React + TypeScript) |
| HTML used to generate the Figma frames | `figma/` in this folder |
| Supabase project | "Kroketez's Project", ref `vpotqgallcsnlehsvszu`, region eu-west-1 |
| Database script | `portfolio/supabase/schema.sql` (already applied) |
| Contact function | `portfolio/supabase/functions/contact/index.ts` (already deployed as `contact`) |
| Setup instructions | `portfolio/README.md` |

## How to run the site

In a terminal, inside the `portfolio` folder: `npm run dev`, then open http://localhost:5173.
The backoffice is at http://localhost:5173/admin (log in with the user created in Supabase > Authentication > Users).

Note: `portfolio/.env` holds the Supabase address and public key. It is not copied by Git, so it must be
recreated from `.env.example` on another computer, and set in Vercel when publishing.

## Done

- Figma: sitemap, 8 wireframes, 18 UI frames (public site, backoffice, English, dark mode, mobile, style guide), prototype links with two flows.
- Website: Home, Sobre mim, Projetos (search and filters), project page, CV (view and PDF download), Contacto, in PT and EN, dark mode, responsive, SEO titles.
- Backoffice: login, session, logout, dashboard, projects, contents, messages, statistics.
- Supabase: tables, access rules, file storage and placeholder content created; site connected; admin user created and login confirmed working.
- Brevo: account created, three secrets saved in Supabase (`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `CONTACT_TO_EMAIL`), test emails delivered to Gmail. IP blocking is off.
- Delete buttons in the backoffice now use a two-click confirmation instead of a browser pop-up.

## Still to do

1. ~~Confirm the Brevo test email arrived.~~ Confirmed on 2026-10-13: the email reached the Gmail inbox, so the contact form works end to end.
2. ~~Replace the Brevo API key.~~ Done on 2026-10-13: old key deleted, new key saved in Supabase, test email arrived.
   Brevo IP blocking confirmed off on 2026-10-16 (API keys and SMTP keys both "Desativada").
3. ~~Close sign-ups in Supabase.~~ Done on 2026-10-16: "Allow new users to sign up" is off.
4. ~~Test the two-click delete button.~~ Tested on 2026-10-14 with the real login: works.
5. ~~Publish.~~ Done on 2026-10-16. Code: https://github.com/Kroketez/portefolio. Live site: https://portefolio-neon-phi.vercel.app (Vercel project "portefolio", both VITE_SUPABASE_* values set).
   To publish changes: run `npx vercel deploy --prod` inside `portfolio`. Optional: connect the GitHub repo in Vercel (Settings > Git, Root Directory `portfolio`) for automatic deploys.
   Live site tested on 2026-10-16: contact form email arrived, backoffice login and Contactos work.
6. ~~Check the Figma prototype.~~ Done on 2026-10-16: all links audited (none broken), both main flows clicked through in Present mode. Added links for PT/EN, dark mode and mobile, and flows "Mobile" and "Dark mode".
7. Add the real content in the backoffice (Conteúdos and Projetos, PT and EN), then update the Figma screens to match.
8. Submit to Moodle: Figma link, source code, website address.

## Known limits

- The backoffice interface is in Portuguese only.
- Free Supabase projects pause after about a week without activity: open the site shortly before it is graded.
- Supabase suggests turning on "leaked password protection" (Authentication settings); optional.