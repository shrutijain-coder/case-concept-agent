-- Case Conceptualisation Practice Platform — Postgres schema for Supabase.
--
-- Apply in the Supabase SQL editor, then set:
--   DATA_BACKEND=supabase
--   NEXT_PUBLIC_SUPABASE_URL=...
--   SUPABASE_SERVICE_ROLE_KEY=...
--
-- The app talks to Postgres server-side with the service-role key, so these
-- RLS policies are not what protects the app today (server actions do that).
-- They are here so that peer-group privacy holds even if a client ever
-- connects with the anon key — the technical PRD requires that the frontend
-- is never trusted to enforce it.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- users ----
create table if not exists users (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  password_hash     text not null,
  display_name      text not null,
  professional_role text,
  experience_level  text,
  role              text not null default 'learner'
                    check (role in ('learner','content_admin','moderator','sysadmin')),
  safety_ack_at     timestamptz,
  created_at        timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  token_hash text primary key,
  user_id    uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------ exercises ----
create table if not exists exercises (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references users(id) on delete cascade,
  case_id            text not null,
  case_version       integer not null,
  modality_id        text check (modality_id in ('cbt','dbt')),
  template_version   integer,
  stage              text not null check (stage in (
                       'vignette','scenarios','modality','conceptualisation',
                       'critical_thinking','self_review','reflection','complete')),
  status             text not null check (status in ('in_progress','complete')),
  scenarios_viewed   jsonb not null default '[]'::jsonb,
  draft              jsonb not null default '{}'::jsonb,
  current_version_id uuid,
  self_review        jsonb not null default '{}'::jsonb,
  reflection         jsonb not null default '{}'::jsonb,
  sharing            text not null default 'undecided'
                     check (sharing in ('undecided','private','group')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  submitted_at       timestamptz,
  completed_at       timestamptz
);
create index if not exists idx_exercises_user on exercises (user_id, updated_at desc);

create table if not exists conceptualisation_versions (
  id                uuid primary key default gen_random_uuid(),
  exercise_id       uuid not null references exercises(id) on delete cascade,
  version_number    integer not null,
  section_responses jsonb not null default '{}'::jsonb,
  change_reason     text,
  created_at        timestamptz not null default now(),
  unique (exercise_id, version_number)
);

-- ------------------------------------------------------ critical thinking --
create table if not exists ct_sessions (
  id           uuid primary key default gen_random_uuid(),
  exercise_id  uuid not null references exercises(id) on delete cascade,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  status       text not null check (status in ('active','complete'))
);
create index if not exists idx_ct_sessions_exercise on ct_sessions (exercise_id);

create table if not exists question_interactions (
  id                           uuid primary key default gen_random_uuid(),
  session_id                   uuid not null references ct_sessions(id) on delete cascade,
  sequence                     integer not null,
  question                     text not null,
  category                     text not null check (category in (
                                 'EVIDENCE_CHECK','ALTERNATIVE_EXPLANATION',
                                 'SPECIFICITY_PUSH','LINK_THE_GAP','STAKES_CHECK')),
  source                       text not null check (source in ('ai','fallback')),
  target_section               text,
  user_response                text,
  conceptualisation_version_id uuid references conceptualisation_versions(id) on delete set null,
  user_action                  text check (user_action in
                                 ('UPDATE_CONCEPTUALISATION','CONTINUE','END_SESSION')),
  created_at                   timestamptz not null default now(),
  unique (session_id, sequence)
);
create index if not exists idx_interactions_session on question_interactions (session_id, sequence);

-- --------------------------------------------------------- peer learning ---
create table if not exists peer_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now(),
  status     text not null default 'active' check (status in ('active','archived'))
);

create table if not exists peer_group_members (
  group_id  uuid not null references peer_groups(id) on delete cascade,
  user_id   uuid not null references users(id) on delete cascade,
  role      text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists peer_submissions (
  id             uuid primary key default gen_random_uuid(),
  exercise_id    uuid not null references exercises(id) on delete cascade,
  user_id        uuid not null references users(id) on delete cascade,
  group_id       uuid not null references peer_groups(id) on delete cascade,
  case_id        text not null,
  modality_id    text not null check (modality_id in ('cbt','dbt')),
  shared_content jsonb not null default '{"conceptualisation":true,"criticalThinking":false}'::jsonb,
  created_at     timestamptz not null default now(),
  status         text not null default 'open' check (status in ('open','withdrawn'))
);
create index if not exists idx_submissions_group on peer_submissions (group_id, created_at desc);

create table if not exists peer_comments (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references peer_submissions(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  status        text not null default 'visible' check (status in ('visible','removed'))
);
create index if not exists idx_comments_submission on peer_comments (submission_id, created_at);

create table if not exists comment_reports (
  id         uuid primary key default gen_random_uuid(),
  comment_id uuid not null references peer_comments(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  reason     text not null check (reason in
               ('inappropriate','harassment','clinical_misinformation','privacy','other')),
  detail     text,
  created_at timestamptz not null default now(),
  status     text not null default 'open' check (status in ('open','resolved'))
);

-- ------------------------------------------------------------ analytics ----
create table if not exists analytics_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete set null,
  name       text not null,
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_name on analytics_events (name, created_at);

-- =========================== ROW LEVEL SECURITY ============================

alter table users                      enable row level security;
alter table password_reset_tokens      enable row level security;
-- No policy on password_reset_tokens: only the service role may touch it.
alter table exercises                  enable row level security;
alter table conceptualisation_versions enable row level security;
alter table ct_sessions                enable row level security;
alter table question_interactions      enable row level security;
alter table peer_groups                enable row level security;
alter table peer_group_members         enable row level security;
alter table peer_submissions           enable row level security;
alter table peer_comments              enable row level security;
alter table comment_reports            enable row level security;
alter table analytics_events           enable row level security;

-- Is the current auth user a member of this group?
create or replace function is_group_member(target_group uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from peer_group_members m
    where m.group_id = target_group and m.user_id = auth.uid()
  );
$$;

-- Own row only.
create policy users_self on users
  for select using (id = auth.uid());

-- Practice data is private to its author, full stop.
create policy exercises_own on exercises
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy versions_own on conceptualisation_versions
  for all using (exists (select 1 from exercises e
                         where e.id = exercise_id and e.user_id = auth.uid()))
  with check (exists (select 1 from exercises e
                      where e.id = exercise_id and e.user_id = auth.uid()));

create policy ct_sessions_own on ct_sessions
  for all using (exists (select 1 from exercises e
                         where e.id = exercise_id and e.user_id = auth.uid()))
  with check (exists (select 1 from exercises e
                      where e.id = exercise_id and e.user_id = auth.uid()));

create policy interactions_own on question_interactions
  for all using (exists (select 1 from ct_sessions s join exercises e on e.id = s.exercise_id
                         where s.id = session_id and e.user_id = auth.uid()))
  with check (exists (select 1 from ct_sessions s join exercises e on e.id = s.exercise_id
                      where s.id = session_id and e.user_id = auth.uid()));

-- Groups: visible only to members.
create policy groups_member_read on peer_groups
  for select using (is_group_member(id));

create policy members_read on peer_group_members
  for select using (user_id = auth.uid() or is_group_member(group_id));

-- A submission is readable by its author and by that group's members, and by
-- nobody else. There is deliberately no public-read policy anywhere.
create policy submissions_read on peer_submissions
  for select using (user_id = auth.uid() or is_group_member(group_id));

create policy submissions_write_own on peer_submissions
  for insert with check (user_id = auth.uid() and is_group_member(group_id));

create policy submissions_update_own on peer_submissions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Comments follow the visibility of the submission they hang off.
create policy comments_read on peer_comments
  for select using (
    status = 'visible'
    and exists (select 1 from peer_submissions s
                where s.id = submission_id
                  and (s.user_id = auth.uid() or is_group_member(s.group_id)))
  );

create policy comments_write on peer_comments
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from peer_submissions s
                where s.id = submission_id and is_group_member(s.group_id))
  );

create policy comments_update_own on peer_comments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy reports_write on comment_reports
  for insert with check (user_id = auth.uid());

create policy reports_read_own on comment_reports
  for select using (user_id = auth.uid());

create policy events_write on analytics_events
  for insert with check (user_id = auth.uid() or user_id is null);
