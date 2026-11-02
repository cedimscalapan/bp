#!/usr/bin/env bash
# Applies the migration + seed to a throwaway Postgres database and runs the RLS checks.
# Needs a local Postgres 15+ you can reach as a superuser, e.g.:
#   PGHOST=localhost PGUSER=postgres npm run db:test
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${PAMANA_TEST_DB:-kapamana_test}"
P=(psql -v ON_ERROR_STOP=1 -q -X)
"${P[@]}" -d postgres -c "drop database if exists $DB" -c "create database $DB"
"${P[@]}" -d "$DB" -f supabase/tests/supabase-stub.sql
"${P[@]}" -d "$DB" -c "set client_min_messages=warning" -f supabase/migrations/20261102000000_kapamana_core.sql
"${P[@]}" -d "$DB" -f supabase/seed.sql
"${P[@]}" -d "$DB" -f supabase/seed.sql   # re-running the seed must be harmless
"${P[@]}" -d "$DB" -f supabase/tests/rls-test.sql
"${P[@]}" -d postgres -c "drop database $DB"
