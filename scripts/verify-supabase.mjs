#!/usr/bin/env node
/**
 * Checks a Supabase project against supabase/migrations/0001_crm.sql:
 * connection, every CRM table, the inquiry-files bucket, anon lockout, and a
 * test inquiry insert + delete with the service role.
 *
 *   npm run verify:supabase            (reads .env.local / .env)
 */
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const missing = [
  ["NEXT_PUBLIC_SUPABASE_URL", url],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceKey],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);
if (missing.length) {
  console.error(`Missing env: ${missing.join(", ")}`);
  process.exit(1);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(url, serviceKey, options);
const anon = createClient(url, anonKey, options);

const TABLES = [
  "admins",
  "inquiries",
  "clients",
  "projects",
  "project_tasks",
  "project_payments",
  "activity_log",
];

let failures = 0;
const ok = (message) => console.log(`  ok   ${message}`);
const bad = (message) => {
  failures += 1;
  console.log(`  FAIL ${message}`);
};

console.log(`Supabase: ${url}`);

for (const table of TABLES) {
  const { error, count } = await service
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) bad(`table ${table}: ${error.message}`);
  else ok(`table ${table} (${count ?? 0} rows)`);
}

const { data: seed } = await service
  .from("admins")
  .select("email")
  .eq("email", "admin@pluck.co.kr")
  .maybeSingle();
if (seed) ok("admins seed admin@pluck.co.kr");
else bad("admins seed admin@pluck.co.kr missing");

const { data: bucket, error: bucketError } = await service.storage.getBucket("inquiry-files");
if (bucketError || !bucket) bad(`bucket inquiry-files: ${bucketError?.message ?? "missing"}`);
else if (bucket.public) bad("bucket inquiry-files is public (must be private)");
else ok(`bucket inquiry-files (private, limit ${bucket.file_size_limit ?? "none"})`);

// anon must not read inquiries: RLS returns an error or zero rows.
const { data: anonRows, error: anonError } = await anon.from("inquiries").select("id").limit(1);
if (anonError || (anonRows ?? []).length === 0) ok("anon cannot read inquiries");
else bad("anon can read inquiries — check RLS");

const { data: inserted, error: insertError } = await service
  .from("inquiries")
  .insert({
    name: "verify-supabase",
    email: "verify@example.com",
    project_type: "other",
    message: "scripts/verify-supabase.mjs test row (deleted immediately)",
    consent_privacy: true,
    source: { page: "scripts/verify-supabase.mjs" },
  })
  .select("id")
  .single();
if (insertError || !inserted) {
  bad(`test insert: ${insertError?.message ?? "no row"}`);
} else {
  ok(`test insert ${inserted.id}`);
  const { error: deleteError } = await service.from("inquiries").delete().eq("id", inserted.id);
  if (deleteError) bad(`test delete: ${deleteError.message}`);
  else ok("test delete");
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
