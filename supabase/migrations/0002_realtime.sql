-- Realtime for the admin CRM (/admin subscribes with postgres_changes).
-- Idempotent. Realtime still applies RLS per subscriber, so only admins
-- (public.is_admin()) receive row payloads; anon has no table grants at all.

do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  foreach t in array array[
    'inquiries', 'clients', 'projects',
    'project_tasks', 'project_payments', 'activity_log'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;
