-- KMZ layers shared across all users
create table if not exists kmz_layers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null,
  visible boolean default true,
  locked boolean default false,
  file_path text not null,
  created_at timestamptz default now()
);

-- Enable public read access
alter table kmz_layers enable row level security;

-- Policies for public access (standard users)
create policy "Public read" on kmz_layers
  for select using (true);

-- Admin policies (management only)
-- Note: These are 'with check (true)' for simplicity as we handle auth via API password gate 
-- rather than Supabase Auth for this specific MVP requirement.
create policy "Admin insert" on kmz_layers
  for insert with check (true);

create policy "Admin update" on kmz_layers
  for update using (true);

create policy "Admin delete" on kmz_layers
  for delete using (true);
