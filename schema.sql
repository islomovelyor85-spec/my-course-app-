-- ============================================================================
-- ARAB XATTOTLIGI TA'LIM PLATFORMASI — SUPABASE SCHEMA
-- Ishga tushirish: Supabase Dashboard -> SQL Editor -> New query -> shu faylni
-- to'liq joylashtirib Run bosing.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique,
  full_name text not null,
  phone text unique,
  password_hash text,               -- telefon+parol orqali ro'yxatdan o'tganlar uchun
  role text not null default 'student' check (role in ('student', 'admin')),
  access_until timestamptz,         -- to'lov muddati tugagach kurs qulflanadi
  avatar_url text,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. COURSES
-- ----------------------------------------------------------------------------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. MODULES
-- ----------------------------------------------------------------------------
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. LESSONS
-- ----------------------------------------------------------------------------
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  video_url text,
  content text,                      -- dars tavsifi / matni
  "order" int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. SUBMISSIONS (o'quvchi topshirgan vazifalar)
-- ----------------------------------------------------------------------------
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  file_url text,
  comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  feedback text,                     -- ustoz izohi
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ----------------------------------------------------------------------------
-- 6. PAYMENTS
-- ----------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  amount numeric not null,
  payment_method text,               -- masalan: 'Payme', 'Click', 'Naqd'
  receipt_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ----------------------------------------------------------------------------
-- FOYDALI INDEKSLAR
-- ----------------------------------------------------------------------------
create index if not exists idx_modules_course on modules(course_id);
create index if not exists idx_lessons_module on lessons(module_id);
create index if not exists idx_submissions_user on submissions(user_id);
create index if not exists idx_submissions_lesson on submissions(lesson_id);
create index if not exists idx_payments_user on payments(user_id);
create index if not exists idx_users_telegram on users(telegram_id);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('lesson-media', 'lesson-media', true)
on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table users enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table submissions enable row level security;
alter table payments enable row level security;

-- Yordamchi funksiya: joriy foydalanuvchi admin ekanligini tekshirish.
-- auth.uid() Supabase Auth foydalanuvchisi bilan mos kelishi uchun,
-- bu loyihada users.id = auth.uid() qilib ishlatiladi (Supabase Auth orqali
-- telefon+parol bilan kirilganda ham, shu id band qilinadi).
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- USERS ----
drop policy if exists "users_select_own_or_admin" on users;
create policy "users_select_own_or_admin"
  on users for select
  using (id = auth.uid() or is_admin());

drop policy if exists "users_update_own_or_admin" on users;
create policy "users_update_own_or_admin"
  on users for update
  using (id = auth.uid() or is_admin());

drop policy if exists "users_insert_self" on users;
create policy "users_insert_self"
  on users for insert
  with check (id = auth.uid());

-- ---- COURSES ----
drop policy if exists "courses_select_published_or_admin" on courses;
create policy "courses_select_published_or_admin"
  on courses for select
  using (is_published = true or is_admin());

drop policy if exists "courses_admin_write" on courses;
create policy "courses_admin_write"
  on courses for all
  using (is_admin())
  with check (is_admin());

-- ---- MODULES ----
drop policy if exists "modules_select_all_authenticated" on modules;
create policy "modules_select_all_authenticated"
  on modules for select
  using (auth.uid() is not null);

drop policy if exists "modules_admin_write" on modules;
create policy "modules_admin_write"
  on modules for all
  using (is_admin())
  with check (is_admin());

-- ---- LESSONS ----
drop policy if exists "lessons_select_all_authenticated" on lessons;
create policy "lessons_select_all_authenticated"
  on lessons for select
  using (auth.uid() is not null);

drop policy if exists "lessons_admin_write" on lessons;
create policy "lessons_admin_write"
  on lessons for all
  using (is_admin())
  with check (is_admin());

-- ---- SUBMISSIONS ----
drop policy if exists "submissions_select_own_or_admin" on submissions;
create policy "submissions_select_own_or_admin"
  on submissions for select
  using (user_id = auth.uid() or is_admin());

drop policy if exists "submissions_insert_own" on submissions;
create policy "submissions_insert_own"
  on submissions for insert
  with check (user_id = auth.uid());

drop policy if exists "submissions_update_own_or_admin" on submissions;
create policy "submissions_update_own_or_admin"
  on submissions for update
  using (user_id = auth.uid() or is_admin());

-- ---- PAYMENTS ----
drop policy if exists "payments_select_own_or_admin" on payments;
create policy "payments_select_own_or_admin"
  on payments for select
  using (user_id = auth.uid() or is_admin());

drop policy if exists "payments_insert_own" on payments;
create policy "payments_insert_own"
  on payments for insert
  with check (user_id = auth.uid());

drop policy if exists "payments_update_admin_only" on payments;
create policy "payments_update_admin_only"
  on payments for update
  using (is_admin());

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

drop policy if exists "submissions_bucket_read" on storage.objects;
create policy "submissions_bucket_read"
  on storage.objects for select
  using (bucket_id = 'submissions');

drop policy if exists "submissions_bucket_insert" on storage.objects;
create policy "submissions_bucket_insert"
  on storage.objects for insert
  with check (bucket_id = 'submissions' and auth.uid() is not null);

drop policy if exists "receipts_bucket_read" on storage.objects;
create policy "receipts_bucket_read"
  on storage.objects for select
  using (bucket_id = 'receipts');

drop policy if exists "receipts_bucket_insert" on storage.objects;
create policy "receipts_bucket_insert"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid() is not null);

drop policy if exists "lesson_media_bucket_read" on storage.objects;
create policy "lesson_media_bucket_read"
  on storage.objects for select
  using (bucket_id = 'lesson-media');

drop policy if exists "lesson_media_bucket_admin_write" on storage.objects;
create policy "lesson_media_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'lesson-media' and is_admin());

-- ============================================================================
-- BIRINCHI ADMIN'NI TAYINLASH (bazani to'ldirgandan keyin qo'lda ishga tushiring)
-- ============================================================================
-- update users set role = 'admin' where phone = '+998901234567';
