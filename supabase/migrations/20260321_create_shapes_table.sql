-- Create shapes table for storing point-in-time shape snapshots
create table if not exists shapes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dimensions jsonb not null,
  source text not null check (source in ('builder', 'pulse', 'conversation')),
  insight jsonb,
  created_at timestamptz not null default now()
);

-- Index for fetching user's shapes (most recent first)
create index idx_shapes_user_created on shapes (user_id, created_at desc);

-- RLS policies
alter table shapes enable row level security;

create policy "Users can read their own shapes"
  on shapes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own shapes"
  on shapes for insert
  with check (auth.uid() = user_id);
