# Isaac's Menu

Een persoonlijke webapp voor het bijhouden van Isaac's eerste voedingsmiddelen, dagboek, recepten, weekplan en voorraad.

## Synchronisatie tussen toestellen (Supabase)

Zonder extra setup werkt de app met `localStorage` — data blijft dan **per toestel** apart staan. Om alles te synchroniseren tussen jouw telefoon, je partners telefoon en je computer:

1. Maak een gratis account op [supabase.com](https://supabase.com) en start een nieuw project (kies een wachtwoord voor de database, dat heb je verder niet nodig).
2. Ga naar **SQL Editor** in je Supabase-project en voer dit uit:

   ```sql
   create table isaac_data (
     id text primary key,
     data jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now()
   );

   alter table isaac_data enable row level security;

   create policy "Allow anon read" on isaac_data for select using (true);
   create policy "Allow anon insert" on isaac_data for insert with check (true);
   create policy "Allow anon update" on isaac_data for update using (true);

   alter publication supabase_realtime add table isaac_data;
   ```

3. Ga naar **Settings → API** en kopieer de **Project URL** en de **anon public key**.
4. Zet die in Vercel: je project → **Settings → Environment Variables**, voeg toe:
   - `VITE_SUPABASE_URL` = je Project URL
   - `VITE_SUPABASE_ANON_KEY` = je anon key
5. Herdeploy (`vercel --prod`, of gewoon een nieuwe deploy triggeren in het Vercel-dashboard).
6. Onderaan de app zie je nu "🔄 Gesynchroniseerd tussen toestellen" in plaats van "📱 Enkel lokaal".

**Belangrijk om te weten:** deze opzet gebruikt geen login — alle data in die tabel is voor iedereen met de anon-key (die client-side zichtbaar is) leesbaar en schrijfbaar. Voor een klein gezinsdingetje over Isaac is dat een redelijke afweging, maar het is dus geen echt beveiligde data. Wil je dat later wel afsluiten met een wachtwoord/login, dan kan dat met Supabase Auth — laat het weten.

Voor lokaal testen: kopieer `.env.example` naar `.env` en vul dezelfde waarden in.

## Lokaal uitproberen

```bash
npm install
npm run dev
```

## Deployen (gratis)

Optie A — **Vercel** (aanbevolen, één commando):

```bash
npm install -g vercel
cd isaac-app
vercel
```

Volg de vragen (project naam, etc.) — Vercel installeert, bouwt en deployt automatisch. Je krijgt een echte `https://...vercel.app` link terug.

Optie B — **Netlify**:

```bash
npm install -g netlify-cli
cd isaac-app
netlify deploy --prod
```

Bij de eerste keer vraagt hij naar een build- en publish-map: gebruik build command `npm run build` en publish directory `dist`.

## Op je beginscherm zetten

1. Open de gedeployde link in **Safari** op je iPhone
2. Tik op het deel-icoon → **"Zet op beginscherm"**
3. Dit werkt nu wél correct, omdat de app een eigen `manifest.json` heeft met de juiste `start_url` — in tegenstelling tot een claude.ai artifact-link.

## Structuur

- `src/App.jsx` — de volledige app (voeding, dagboek, recepten, weekplan, voorraad, export)
- `vite.config.js` — bouwconfiguratie + PWA-instellingen (naam, iconen, kleuren)
- `public/icon-192.png` / `icon-512.png` — app-icoontjes
