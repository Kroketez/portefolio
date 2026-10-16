# Portefólio profissional

Website de portefólio com backoffice. Vite + React + TypeScript, com Supabase
(base de dados, autenticação, ficheiros e função de servidor) e Brevo para o
envio do formulário de contacto.

## Correr no computador

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

Sem o ficheiro `.env`, o site corre em **modo de demonstração**: os dados ficam
guardados só no navegador e o login do backoffice (`/admin`) usa as credenciais
de demonstração mostradas no ecrã de login. Serve para experimentar; não envia
emails.

## Ligar ao Supabase

1. Cria um projeto em https://supabase.com.
2. No **SQL Editor**, cola e corre o ficheiro `supabase/schema.sql`. Cria as
   tabelas, as regras de acesso, o armazenamento de ficheiros e os conteúdos de
   exemplo.
3. Em **Authentication > Users**, cria o teu utilizador (email e palavra-passe).
   Em **Authentication > Sign In / Providers**, desliga o registo público
   ("Allow new users to sign up"): qualquer utilizador autenticado é
   administrador.
4. Copia `.env.example` para `.env` e preenche `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` (Project Settings > API).

## Formulário de contacto com Brevo

O formulário chama a função `supabase/functions/contact`, que corre nos
servidores do Supabase: valida os dados, guarda a mensagem e envia o email pela
API do Brevo. A chave do Brevo fica guardada como segredo do Supabase e nunca
chega ao navegador.

```bash
npx supabase login
npx supabase link --project-ref <ref-do-projeto>
npx supabase secrets set BREVO_API_KEY=<chave> BREVO_SENDER_EMAIL=<remetente verificado no Brevo> CONTACT_TO_EMAIL=<o teu email>
npx supabase functions deploy contact
```

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/pages` | Páginas públicas: Home, Sobre mim, Projetos, Projeto, CV, Contacto |
| `src/admin` | Backoffice: login, dashboard, projetos, conteúdos, contactos, estatísticas |
| `src/lib/db.ts` | Camada de dados única (Supabase ou modo de demonstração) |
| `src/lib/i18n.ts` | Textos da interface em português e inglês |
| `src/lib/contentKeys.ts` | Lista dos textos editáveis no backoffice |
| `src/index.css` | Estilos, com modo claro e escuro |
| `supabase/schema.sql` | Base de dados e regras de acesso |
| `supabase/functions/contact` | Função de servidor do formulário (Brevo) |

## Publicar

`npm run build` gera a pasta `dist`. Em Vercel ou Netlify, define as duas
variáveis `VITE_SUPABASE_*` no painel do serviço. O ficheiro `vercel.json` já
encaminha todos os endereços para o `index.html`.
