-- Shukaansi AI: user profiles (tone preference)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  tone text not null default 'balanced'
    check (tone in ('balanced', 'romantic', 'playful', 'confident', 'respectful')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

grant select, insert, update on table public.profiles to authenticated;

-- Auto-create a profile row (with default tone) on every new sign-up
-- (works for email accounts today; any future OAuth provider too).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
