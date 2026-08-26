-- Buffer layers (geodesic circles generated from CSV) — mirrors kmz_layers
create table if not exists buffer_layers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  visible boolean default true,
  locked boolean default false,
  file_path text not null,
  geojson jsonb not null,
  created_at timestamptz default now()
);

alter table buffer_layers enable row level security;

create policy "Public read" on buffer_layers
  for select using (true);

create policy "Admin insert" on buffer_layers
  for insert with check (true);

create policy "Admin update" on buffer_layers
  for update using (true);

create policy "Admin delete" on buffer_layers
  for delete using (true);

-- Teams (group boundary layers by field team)
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  layer_ids uuid[] not null default '{}',
  created_at timestamptz default now()
);

alter table teams enable row level security;

create policy "Public read" on teams
  for select using (true);

create policy "Admin insert" on teams
  for insert with check (true);

create policy "Admin update" on teams
  for update using (true);

create policy "Admin delete" on teams
  for delete using (true);
