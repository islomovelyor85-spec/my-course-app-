# Xattot — Arab xattotligi ta'lim platformasi

To'liq ishlaydigan Telegram Mini App (React + Vite + Tailwind) va Supabase backend.

## Tuzilma

```
supabase/
  schema.sql                  ← baza jadvallari, RLS siyosatlari, storage bucketlar
  functions/telegram-auth/    ← Telegram initData'ni tasdiqlaydigan Edge Function
src/
  lib/                        ← supabase client, telegram helper, ma'lumot so'rovlari
  context/AuthContext.jsx     ← autentifikatsiya (telefon+parol va Telegram)
  routes/ProtectedRoute.jsx   ← rol bo'yicha yo'naltirish (student / admin)
  components/layout/          ← StudentLayout (pastki nav), AdminLayout (sidebar)
  components/common/          ← qayta ishlatiladigan UI qismlari
  pages/auth/                 ← Login, Register
  pages/student/              ← Bosh sahifa, Kursim, Dars, Vazifalar, Progress, Profil
  pages/admin/                ← Dashboard, Darslar boshqaruvi, Vazifa/To'lov tekshirish
```

## 1. Supabase sozlash

1. supabase.com'da yangi loyiha yarating.
2. **SQL Editor**'ga kirib `supabase/schema.sql` faylini to'liq nusxalab ishga tushiring.
   Bu barcha jadvallarni, RLS (Row Level Security) siyosatlarini va 3 ta Storage
   bucket'ni (`submissions`, `receipts`, `lesson-media`) yaratadi.
3. **Settings → API** bo'limidan `Project URL` va `anon public key`'ni oling.

## 2. Frontend sozlash

```bash
npm install
cp .env.example .env
# .env faylni oching va VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY qiymatlarini kiriting
npm run dev
```

Production build: `npm run build` → natija `dist/` papkasida.

## 3. Telegram bot va Mini App

1. @BotFather orqali bot yarating, token oling.
2. `supabase/functions/telegram-auth` funksiyasini deploy qiling:
   ```bash
   supabase functions deploy telegram-auth
   supabase secrets set TELEGRAM_BOT_TOKEN=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx
   ```
   Bu funksiya Telegram'dan kelgan `initData`'ni bot tokeni bilan HMAC orqali
   tasdiqlaydi va foydalanuvchiga Supabase Auth sessiyasi (magic-link token) beradi —
   shu orqali parolsiz, xavfsiz avtomatik kirish ta'minlanadi.
3. Frontend'ni biror hostingga (Vercel/Netlify) joylang, olingan URL'ni
   BotFather'da **Menu Button / Mini App** sifatida bog'lang.

## 4. Birinchi admin (ustoz)ni tayinlash

Supabase → Table Editor → `users` jadvalida o'zingizning qatoringizni toping
(ro'yxatdan o'tgach paydo bo'ladi) va `role` ustunini `admin` ga o'zgartiring.
Shundan keyin `/admin` route'ga kira olasiz.

## Muhim arxitektura izohi: parol saqlash

Brifda `users.password_hash` ustuni so'ralgan edi, lekin xavfsizlik nuqtai
nazaridan parolni **qo'lda hash qilib o'zimiz saqlash o'rniga**, Supabase Auth'ning
o'ziga ishonib topshirdik: telefon raqam `<raqam>@xattot.local` ko'rinishidagi
sintetik email'ga aylantiriladi va standart `supabase.auth.signUp` /
`signInWithPassword` orqali ishlaydi. Bu yondashuv:
- parolni to'g'ridan-to'g'ri kodda hech qachon ko'rsatmaydi,
- Supabase'ning tekshirilgan, xavfsiz autentifikatsiya tizimidan foydalanadi,
- `auth.uid()` orqali RLS (xavfsizlik) siyosatlarini to'g'ridan-to'g'ri ishlatish
  imkonini beradi (agar parolni qo'lda hash qilganimizda, RLS uchun qo'shimcha
  Edge Function + custom JWT kerak bo'lar edi).

`password_hash` ustuni schema'da (kelajakda boshqa maqsad uchun) qoldirilgan,
lekin ilova uni ishlatmaydi — bu qasddan qilingan, ideal xavfsizlik tanlovi.

## Gemini bilan davom ettirish

Loyiha to'liq standart Vite + React + Tailwind + Supabase stack'da yozilgan —
hech qanday maxsus/yopiq vosita ishlatilmagan. Agar Claude bilan davom ettira
olmasangiz, shu papkani (yoki GitHub repo'sini) Gemini'ga: "Bu Vite+React+
Supabase loyihasi, [aniq talab]ni qo'shib ber" tarzida bersangiz, xuddi shu
kod uslubida davom ettira oladi.

## Sinab ko'rish tartibi

1. `npm run dev` bilan ishga tushiring, brauzerda `/register` orqali test
   o'quvchi yarating.
2. Supabase'da shu foydalanuvchini `role='admin'` qiling, `/admin`'ga kiring.
3. Admin panelda test kurs → modul → dars yarating, kursni "Chop etilgan"
   holatiga o'tkazing.
4. Yangi (student) foydalanuvchi bilan kirib, to'lov cheki yuklang.
5. Admin sifatida to'lovni tasdiqlang → darslar ochilishini tekshiring.
6. Student sifatida vazifa topshiring → admin sifatida tasdiqlang/qaytaring.
