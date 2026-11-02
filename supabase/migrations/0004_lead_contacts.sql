-- Contact columns for outbound leads (영업 리드).
-- Idempotent: safe to paste into the Supabase SQL editor more than once.
-- Requires 0003_leads.sql.
--
-- Only publicly posted BUSINESS contacts (company site footer / public listings):
-- 대표전화, 대표·문의 이메일, 문의 폼 URL. Used for 1:1 phone/contact-form outreach,
-- not bulk advertising mail (정보통신망법 제50조: no unsolicited ad email/SMS).

alter table public.leads add column if not exists company text;
alter table public.leads add column if not exists website text;
alter table public.leads add column if not exists phone text;
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists contact_form_url text;
-- Web agency credited on the site (e.g. "Designed by ..."), with dead-agency evidence in memo.
alter table public.leads add column if not exists agency text;
-- Neglect signals seen on the site: SSL 없음, ©2016, gnuboard4, 비반응형 ...
alter table public.leads add column if not exists signals text[] not null default '{}';
