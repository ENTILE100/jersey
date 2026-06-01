-- =====================================================================
-- JerseyDek database schema (hardened)
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run on an existing project.
-- =====================================================================

-- 1) PROFILES: PUBLIC, non-sensitive info only (safe for anyone to read).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  university text,
  created_at timestamptz default now()
);

-- 1b) SELLER CONTACTS: SENSITIVE info (phone). NOT world-readable.
--     Only logged-in users can read it, so it can't be scraped anonymously.
create table if not exists seller_contacts (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  updated_at timestamptz default now()
);

-- If you already created profiles with a phone column, move it over then drop it:
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'phone'
  ) then
    insert into seller_contacts (id, phone)
      select id, phone from profiles where phone is not null
      on conflict (id) do nothing;
    alter table profiles drop column phone;
  end if;
end $$;

-- Auto-create a profile + empty contact row on sign up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  insert into public.seller_contacts (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) JERSEYS: the items people list for sale (with validation built in).
create table if not exists jerseys (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  university text,
  size text,
  condition text,
  price integer not null,
  description text,
  image_url text,
  status text default 'available',
  created_at timestamptz default now()
);

create index if not exists jerseys_created_idx on jerseys (created_at desc);

-- 2b) VALIDATION CONSTRAINTS — enforced by the database, not just the form.
--     (DROP first so this script can be re-run safely.)
alter table jerseys drop constraint if exists chk_price;
alter table jerseys drop constraint if exists chk_title;
alter table jerseys drop constraint if exists chk_desc;
alter table jerseys drop constraint if exists chk_status;
alter table jerseys drop constraint if exists chk_image;

alter table jerseys
  add constraint chk_price  check (price >= 0 and price <= 1000000),
  add constraint chk_title  check (char_length(title) between 1 and 120),
  add constraint chk_desc   check (description is null or char_length(description) <= 2000),
  add constraint chk_status check (status in ('available', 'sold')),
  -- image_url must be null OR point to YOUR own storage bucket (blocks
  -- attackers from setting it to an arbitrary external URL).
  add constraint chk_image  check (
    image_url is null
    or image_url like '%/storage/v1/object/public/jerseys/%'
  );

-- 3) ROW LEVEL SECURITY.
alter table profiles        enable row level security;
alter table seller_contacts enable row level security;
alter table jerseys         enable row level security;

-- Profiles (public info): anyone can read; only you can edit your own.
drop policy if exists "profiles read"  on profiles;
drop policy if exists "profiles write" on profiles;
create policy "profiles read"  on profiles for select using (true);
create policy "profiles write" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Seller contacts (phone): only LOGGED-IN users can read; only you edit yours.
drop policy if exists "contacts read"  on seller_contacts;
drop policy if exists "contacts write" on seller_contacts;
create policy "contacts read"  on seller_contacts for select
  using (auth.role() = 'authenticated');
create policy "contacts write" on seller_contacts for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Jerseys: anyone can browse; only the seller manages their own.
drop policy if exists "jerseys read"   on jerseys;
drop policy if exists "jerseys insert" on jerseys;
drop policy if exists "jerseys update" on jerseys;
drop policy if exists "jerseys delete" on jerseys;
create policy "jerseys read"   on jerseys for select using (true);
create policy "jerseys insert" on jerseys for insert with check (auth.uid() = seller_id);
create policy "jerseys update" on jerseys for update
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy "jerseys delete" on jerseys for delete using (auth.uid() = seller_id);

-- 4) STORAGE: public-read bucket for photos, but locked-down writes.
--    Images only, 5 MB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jerseys', 'jerseys', true, 5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

-- Anyone can view images; but you may only write/delete inside YOUR own
-- folder (the first path segment must equal your user id).
drop policy if exists "jersey images read"   on storage.objects;
drop policy if exists "jersey images upload" on storage.objects;
drop policy if exists "jersey images delete" on storage.objects;
create policy "jersey images read"
  on storage.objects for select using (bucket_id = 'jerseys');
create policy "jersey images upload"
  on storage.objects for insert with check (
    bucket_id = 'jerseys'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "jersey images delete"
  on storage.objects for delete using (
    bucket_id = 'jerseys'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
