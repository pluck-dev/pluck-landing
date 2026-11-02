-- Outbound sales leads (영업 리드) for the admin CRM.
-- Idempotent: safe to paste into the Supabase SQL editor more than once.
-- Requires 0001_crm.sql (public.is_admin(), activity_log) and 0002_realtime.sql.
--
-- Scraped prospects (e.g. companies whose dev agency closed), kept apart from
-- inquiries: they have no email/consent, and must not touch inbound stats or the
-- Discord webhook. Re-imports dedupe on url.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  campaign text not null default '폐업 개발사',
  kind text not null default 'lead' check (kind in ('lead', 'competitor')),
  -- 위시켓 / 지식iN / 카페 / 블로그 ...
  source text,
  -- 상황: 개발사 폐업 / 연락두절 / 소스 인수 ...
  category text,
  -- 홈페이지 / 앱 / 쇼핑몰 / ERP·사내프로그램 ...
  system_type text,
  title text,
  summary text,
  region text,
  budget text,
  -- Raw string on purpose: sources give fuzzy dates like "2026-10-27 (5일 전)".
  posted_at text,
  -- 모집 중 / 모집 마감 / 게시글 ...
  recruit_status text,
  -- 상 / 중 / 하
  quality text,
  -- A / B / C
  freshness text,
  url text,
  status text not null default 'new' check (
    status in ('new', 'contacted', 'replied', 'won', 'lost', 'skip')
  ),
  memo text
);

-- NULLs are distinct, so rows without a url never collide.
create unique index if not exists leads_url_key on public.leads (url);
create index if not exists leads_kind_status_idx on public.leads (kind, status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
before update on public.leads
for each row execute function public.touch_updated_at();

-- RLS: same model as the other CRM tables.
alter table public.leads enable row level security;
revoke all on table public.leads from anon;
grant select, insert, update, delete on table public.leads to authenticated;
drop policy if exists "crm admins full access" on public.leads;
create policy "crm admins full access" on public.leads
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- activity_log may now reference leads.
alter table public.activity_log drop constraint if exists activity_log_entity_check;
alter table public.activity_log add constraint activity_log_entity_check check (
  entity in ('inquiry', 'client', 'project', 'task', 'payment', 'lead')
);

-- Realtime for /admin.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leads'
  ) then
    alter publication supabase_realtime add table public.leads;
  end if;
end;
$$;
