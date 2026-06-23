-- Клюнуло MVP database schema
-- Run this in Supabase SQL Editor once.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.fish_species (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  image_url text,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.user_species (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  species_id uuid not null references public.fish_species(id) on delete cascade,
  status text not null default 'caught_manual' check (status in ('caught_manual', 'caught_trophy', 'caught_both')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, species_id)
);

create table if not exists public.trophies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  species_id uuid not null references public.fish_species(id) on delete restrict,
  photo_url text,
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  length_cm numeric check (length_cm is null or length_cm >= 0),
  date_caught date,
  place_name text,
  bait text,
  note text,
  visibility text not null default 'friends' check (visibility in ('private', 'friends', 'link')),
  show_place boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null constraint friendships_requester_id_fkey references public.users(id) on delete cascade,
  receiver_id uuid not null constraint friendships_receiver_id_fkey references public.users(id) on delete cascade,
  status text not null default 'accepted' check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  check (requester_id <> receiver_id),
  unique(requester_id, receiver_id)
);

create index if not exists idx_user_species_user_id on public.user_species(user_id);
create index if not exists idx_trophies_user_id on public.trophies(user_id);
create index if not exists idx_trophies_species_id on public.trophies(species_id);
create index if not exists idx_friendships_requester on public.friendships(requester_id);
create index if not exists idx_friendships_receiver on public.friendships(receiver_id);

-- We use server-side API routes with SUPABASE_SERVICE_ROLE_KEY.
-- RLS stays enabled so the public anon key cannot read/write tables directly.
alter table public.users enable row level security;
alter table public.fish_species enable row level security;
alter table public.user_species enable row level security;
alter table public.trophies enable row level security;
alter table public.friendships enable row level security;

-- Public bucket for MVP photos. For serious privacy later: switch to private bucket + signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trophy-photos',
  'trophy-photos',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
