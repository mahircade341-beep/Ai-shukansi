-- Shukaansi AI: initial schema
-- chats: one row per conversation owned by an auth user
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Wada hadal cusub',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chats_user_created_idx
  on public.chats (user_id, created_at desc);

create index if not exists messages_chat_created_idx
  on public.messages (chat_id, created_at asc);

-- Row Level Security: each user only sees their own data
alter table public.chats enable row level security;
alter table public.messages enable row level security;

drop policy if exists chats_select_own on public.chats;
drop policy if exists chats_insert_own on public.chats;
drop policy if exists chats_update_own on public.chats;
drop policy if exists chats_delete_own on public.chats;

drop policy if exists messages_select_own on public.messages;
drop policy if exists messages_insert_own on public.messages;
drop policy if exists messages_update_own on public.messages;
drop policy if exists messages_delete_own on public.messages;

create policy chats_select_own on public.chats
  for select using (auth.uid() = user_id);
create policy chats_insert_own on public.chats
  for insert with check (auth.uid() = user_id);
create policy chats_update_own on public.chats
  for update using (auth.uid() = user_id);
create policy chats_delete_own on public.chats
  for delete using (auth.uid() = user_id);

create policy messages_select_own on public.messages
  for select using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and c.user_id = auth.uid()
    )
  );
create policy messages_insert_own on public.messages
  for insert with check (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and c.user_id = auth.uid()
    )
  );
create policy messages_update_own on public.messages
  for update using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and c.user_id = auth.uid()
    )
  );
create policy messages_delete_own on public.messages
  for delete using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and c.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on table public.chats to authenticated;
grant select, insert, update, delete on table public.messages to authenticated;

-- Live updates: broadcast chats/messages changes to subscribed clients
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.chats;
    alter publication supabase_realtime add table public.messages;
  end if;
exception when duplicate_object then null;
end $$;
