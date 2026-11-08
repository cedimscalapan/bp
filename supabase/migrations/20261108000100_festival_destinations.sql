alter table public.destinations drop constraint if exists destinations_adventure_group_check;
alter table public.destinations add constraint destinations_adventure_group_check
  check (adventure_group in ('Oriental Mindoro', 'Oriental Mindoro Festivals', 'North Luzon', 'South Luzon', 'Metro Manila', 'Island Voyage', 'International'));
alter table public.destinations add column if not exists passport_image text;
alter table public.destinations add column if not exists sprite_image text;
alter table public.destinations add column if not exists sprite_name text;
