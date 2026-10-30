-- PLUCK inquiry system + admin CRM.
-- Idempotent: safe to paste into the Supabase SQL editor more than once.
--
-- Access model
--   * anon: no table access at all. The public /contact form posts to a Next.js
--     server action that writes with the service role key (bypasses RLS).
--   * authenticated: full access only when public.is_admin() is true, i.e. the
--     JWT email is listed in public.admins. Everyone else sees nothing.
--   * service_role: bypasses RLS (server-only key, never shipped to browsers).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- admins + is_admin()
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

insert into public.admins (email) values ('admin@pluck.co.kr')
on conflict (email) do nothing;

-- SECURITY DEFINER so policies (including the one on admins itself) can check
-- membership without recursing into admins' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- inquiries
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 60),
  company text check (char_length(company) <= 80),
  email text not null check (char_length(email) <= 120),
  phone text check (char_length(phone) <= 30),
  project_type text not null check (
    project_type in ('website', 'webapp', 'app', 'ai_automation', 'maintenance', 'other')
  ),
  budget text check (
    budget in ('under_3m', '3m_10m', '10m_30m', 'over_30m', 'undecided')
  ),
  timeline text check (
    timeline in ('asap', 'within_1m', '1m_3m', 'after_3m', 'flexible')
  ),
  message text not null check (char_length(message) between 1 and 5000),
  reference_urls text[] not null default '{}',
  -- [{ path, name, size, type }] objects in the inquiry-files bucket
  attachments jsonb not null default '[]'::jsonb,
  -- { utm: {...}, referrer, landing, page, first_seen }
  source jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'quoted', 'won', 'lost', 'on_hold')
  ),
  admin_memo text,
  consent_privacy boolean not null default false,
  ip_hash text,
  user_agent text
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_ip_hash_idx on public.inquiries (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  email text,
  phone text,
  memo text
);

create index if not exists clients_email_idx on public.clients (lower(email));

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references public.clients (id) on delete restrict,
  inquiry_id uuid references public.inquiries (id) on delete set null,
  name text not null,
  type text not null default 'other' check (
    type in ('website', 'webapp', 'app', 'ai_automation', 'maintenance', 'other')
  ),
  status text not null default 'planning' check (
    status in ('planning', 'contract', 'in_progress', 'review', 'done', 'maintenance', 'paused')
  ),
  start_date date,
  due_date date,
  contract_amount numeric(14, 0) not null default 0 check (contract_amount >= 0),
  -- Derived: kept in sync with project_payments by trigger below.
  paid_amount numeric(14, 0) not null default 0,
  repo_url text,
  live_url text,
  notes text
);

create index if not exists projects_client_idx on public.projects (client_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_due_idx on public.projects (due_date);

-- ---------------------------------------------------------------------------
-- project_tasks
-- ---------------------------------------------------------------------------
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  done boolean not null default false,
  due_date date,
  sort integer not null default 0
);

create index if not exists project_tasks_project_idx on public.project_tasks (project_id, sort);

-- ---------------------------------------------------------------------------
-- project_payments
-- ---------------------------------------------------------------------------
create table if not exists public.project_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label text not null check (label in ('계약금', '중도금', '잔금', '유지보수', '기타')),
  amount numeric(14, 0) not null check (amount >= 0),
  due_date date,
  paid_at date
);

create index if not exists project_payments_project_idx on public.project_payments (project_id);

create or replace function public.sync_project_paid_amount()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  if tg_op = 'DELETE' then
    target := old.project_id;
  else
    target := new.project_id;
  end if;

  update public.projects
  set paid_amount = coalesce((
    select sum(amount) from public.project_payments
    where project_id = target and paid_at is not null
  ), 0)
  where id = target;

  if tg_op = 'UPDATE' and old.project_id is distinct from new.project_id then
    update public.projects
    set paid_amount = coalesce((
      select sum(amount) from public.project_payments
      where project_id = old.project_id and paid_at is not null
    ), 0)
    where id = old.project_id;
  end if;

  return null;
end;
$$;

drop trigger if exists project_payments_sync_paid on public.project_payments;
create trigger project_payments_sync_paid
after insert or update or delete on public.project_payments
for each row execute function public.sync_project_paid_amount();

-- ---------------------------------------------------------------------------
-- activity_log
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  entity text not null check (entity in ('inquiry', 'client', 'project', 'task', 'payment')),
  entity_id uuid not null,
  action text not null,
  detail jsonb not null default '{}'::jsonb
);

create index if not exists activity_log_entity_idx on public.activity_log (entity, entity_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: on for every table, anon gets nothing, admins get everything.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'admins', 'inquiries', 'clients', 'projects',
    'project_tasks', 'project_payments', 'activity_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('drop policy if exists "crm admins full access" on public.%I', t);
    execute format(
      'create policy "crm admins full access" on public.%I
         for all to authenticated
         using (public.is_admin())
         with check (public.is_admin())',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for optional inquiry attachments.
-- Uploads come through signed upload URLs created by the server (service role),
-- so no insert policy is needed. Admins can read/delete.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inquiry-files',
  'inquiry-files',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "crm admins read inquiry files" on storage.objects;
create policy "crm admins read inquiry files" on storage.objects
  for select to authenticated
  using (bucket_id = 'inquiry-files' and public.is_admin());

drop policy if exists "crm admins delete inquiry files" on storage.objects;
create policy "crm admins delete inquiry files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'inquiry-files' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Retention (개인정보처리방침: 문의 정보 보유기간 1년).
-- Deletes inquiries older than 1 year that never became a project.
-- Run manually or schedule with pg_cron (see supabase/README.md).
-- Attachment files must be removed from storage separately (README).
-- ---------------------------------------------------------------------------
create or replace function public.purge_expired_inquiries()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.inquiries i
  where i.created_at < now() - interval '1 year'
    and not exists (select 1 from public.projects p where p.inquiry_id = i.id);
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_expired_inquiries() from public, anon, authenticated;
grant execute on function public.purge_expired_inquiries() to service_role;
