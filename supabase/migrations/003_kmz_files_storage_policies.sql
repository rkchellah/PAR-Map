-- Storage RLS for the kmz-files bucket (bucket itself already created as public,
-- but Storage still enforces its own RLS on storage.objects for writes).
create policy "kmz-files public read" on storage.objects
  for select using (bucket_id = 'kmz-files');

create policy "kmz-files admin insert" on storage.objects
  for insert with check (bucket_id = 'kmz-files');

create policy "kmz-files admin update" on storage.objects
  for update using (bucket_id = 'kmz-files');

create policy "kmz-files admin delete" on storage.objects
  for delete using (bucket_id = 'kmz-files');
