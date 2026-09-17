-- ═══════════════════════════════════════════════════════════════════════════════
-- OUR TABLE — Supabase Schema  (paste into Supabase SQL Editor and run)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────────────────
create type household_role as enum ('owner', 'member');
create type recipe_source  as enum ('manual', 'url', 'tiktok', 'instagram', 'youtube');
create type pantry_type    as enum ('fridge', 'pantry', 'freezer');


-- ══════════════════════════════════════════════════════════════════════════════
-- PROFILES  (extends auth.users)
-- ══════════════════════════════════════════════════════════════════════════════
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  name          text not null,
  avatar_url    text,
  household_id  uuid,                          -- FK added after households table
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- Auto-create profile on sign-up
-- NOTE: this trigger fires on auth.users, so it needs an explicit search_path
-- (or schema-qualified table names) — without it Postgres can't reliably
-- resolve `profiles`, and auth.signUp() fails client-side with the generic
-- "Database error saving new user".
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();


-- ══════════════════════════════════════════════════════════════════════════════
-- HOUSEHOLDS
-- ══════════════════════════════════════════════════════════════════════════════
create table households (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  owner_id   uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Now add the FK from profiles → households
alter table profiles
  add constraint profiles_household_id_fkey
  foreign key (household_id) references households(id) on delete set null;


-- ══════════════════════════════════════════════════════════════════════════════
-- HOUSEHOLD MEMBERS
-- ══════════════════════════════════════════════════════════════════════════════
create table household_members (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  profile_id   uuid not null references profiles(id)   on delete cascade,
  role         household_role not null default 'member',
  joined_at    timestamptz default now() not null,
  unique (household_id, profile_id)
);


-- ══════════════════════════════════════════════════════════════════════════════
-- DIETARY PREFERENCES  (per profile)
-- ══════════════════════════════════════════════════════════════════════════════
create table dietary_preferences (
  id         uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  preference text not null,
  unique (profile_id, preference)
);


-- ══════════════════════════════════════════════════════════════════════════════
-- RECIPES
-- ══════════════════════════════════════════════════════════════════════════════
create table recipes (
  id                  uuid primary key default uuid_generate_v4(),
  household_id        uuid not null references households(id) on delete cascade,
  title               text not null,
  description         text,
  source_url          text,
  source_type         recipe_source not null default 'manual',
  image_url           text,
  cook_time_minutes   int,
  prep_time_minutes   int,
  servings            int,
  category            text,
  calories            int,
  rating              numeric(2,1),
  created_by          uuid not null references profiles(id),
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create trigger recipes_updated_at
  before update on recipes
  for each row execute function set_updated_at();


-- ══════════════════════════════════════════════════════════════════════════════
-- INGREDIENTS
-- ══════════════════════════════════════════════════════════════════════════════
create table ingredients (
  id         uuid primary key default uuid_generate_v4(),
  recipe_id  uuid not null references recipes(id) on delete cascade,
  name       text not null,
  amount     text,
  unit       text,
  notes      text,
  sort_order int not null default 0
);


-- ══════════════════════════════════════════════════════════════════════════════
-- INSTRUCTIONS
-- ══════════════════════════════════════════════════════════════════════════════
create table instructions (
  id          uuid primary key default uuid_generate_v4(),
  recipe_id   uuid not null references recipes(id) on delete cascade,
  step_number int not null,
  text        text not null,
  unique (recipe_id, step_number)
);


-- ══════════════════════════════════════════════════════════════════════════════
-- RECIPE TAGS
-- ══════════════════════════════════════════════════════════════════════════════
create table recipe_tags (
  id        uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  tag       text not null,
  unique (recipe_id, tag)
);


-- ══════════════════════════════════════════════════════════════════════════════
-- GROCERY LISTS
-- ══════════════════════════════════════════════════════════════════════════════
create table grocery_lists (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null default 'Weekly Shop',
  created_at   timestamptz default now() not null
);


-- ══════════════════════════════════════════════════════════════════════════════
-- GROCERY ITEMS
-- ══════════════════════════════════════════════════════════════════════════════
create table grocery_items (
  id         uuid primary key default uuid_generate_v4(),
  list_id    uuid not null references grocery_lists(id) on delete cascade,
  name       text not null,
  amount     text,
  unit       text,
  aisle      text,
  recipe_id  uuid references recipes(id) on delete set null,
  is_checked boolean not null default false,
  checked_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

-- Real-time subscriptions need this
alter table grocery_items replica identity full;


-- ══════════════════════════════════════════════════════════════════════════════
-- FRIDGE ITEMS
-- ══════════════════════════════════════════════════════════════════════════════
create table fridge_items (
  id           uuid primary key default uuid_generate_v4(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  quantity     text,
  unit         text,
  expires_at   date,
  category     text,
  location     pantry_type not null default 'fridge',
  added_by     uuid not null references profiles(id),
  created_at   timestamptz default now() not null
);


-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

alter table profiles            enable row level security;
alter table households          enable row level security;
alter table household_members   enable row level security;
alter table dietary_preferences enable row level security;
alter table recipes             enable row level security;
alter table ingredients         enable row level security;
alter table instructions        enable row level security;
alter table recipe_tags         enable row level security;
alter table grocery_lists       enable row level security;
alter table grocery_items       enable row level security;
alter table fridge_items        enable row level security;

-- ── Profiles ──────────────────────────────────────────────────────────────────
create policy "Users can read their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Household members can read each other's profiles
create policy "Household members can read each other"
  on profiles for select using (
    household_id in (
      select household_id from profiles where id = auth.uid()
    )
  );

-- ── Households ────────────────────────────────────────────────────────────────
create policy "Household members can read household"
  on households for select using (
    id in (select household_id from profiles where id = auth.uid())
  );

create policy "Owner can update household"
  on households for update using (owner_id = auth.uid());

create policy "Authenticated users can create household"
  on households for insert with check (auth.uid() = owner_id);

-- ── Household Members ─────────────────────────────────────────────────────────
create policy "Household members can read member list"
  on household_members for select using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Owner can manage members"
  on household_members for all using (
    household_id in (select id from households where owner_id = auth.uid())
  );

-- ── Dietary Preferences ───────────────────────────────────────────────────────
create policy "Users manage own dietary prefs"
  on dietary_preferences for all using (profile_id = auth.uid());

create policy "Household members can read dietary prefs"
  on dietary_preferences for select using (
    profile_id in (
      select id from profiles
      where household_id = (select household_id from profiles where id = auth.uid())
    )
  );

-- ── Recipes ───────────────────────────────────────────────────────────────────
create policy "Household members can read recipes"
  on recipes for select using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Household members can create recipes"
  on recipes for insert with check (
    household_id in (select household_id from profiles where id = auth.uid())
    and created_by = auth.uid()
  );

create policy "Recipe creator can update/delete"
  on recipes for update using (created_by = auth.uid());

create policy "Recipe creator can delete"
  on recipes for delete using (created_by = auth.uid());

-- ── Ingredients / Instructions / Tags — inherit recipe access ─────────────────
create policy "Household members can read ingredients"
  on ingredients for select using (
    recipe_id in (
      select id from recipes where household_id in (
        select household_id from profiles where id = auth.uid()
      )
    )
  );

create policy "Household members can manage ingredients"
  on ingredients for all using (
    recipe_id in (
      select id from recipes where created_by = auth.uid()
    )
  );

create policy "Household members can read instructions"
  on instructions for select using (
    recipe_id in (
      select id from recipes where household_id in (
        select household_id from profiles where id = auth.uid()
      )
    )
  );

create policy "Household members can manage instructions"
  on instructions for all using (
    recipe_id in (select id from recipes where created_by = auth.uid())
  );

create policy "Household members can read tags"
  on recipe_tags for select using (
    recipe_id in (
      select id from recipes where household_id in (
        select household_id from profiles where id = auth.uid()
      )
    )
  );

create policy "Household members can manage tags"
  on recipe_tags for all using (
    recipe_id in (select id from recipes where created_by = auth.uid())
  );

-- ── Grocery Lists + Items ─────────────────────────────────────────────────────
create policy "Household members can read/manage grocery lists"
  on grocery_lists for all using (
    household_id in (select household_id from profiles where id = auth.uid())
  );

create policy "Household members can read/manage grocery items"
  on grocery_items for all using (
    list_id in (
      select id from grocery_lists where household_id in (
        select household_id from profiles where id = auth.uid()
      )
    )
  );

-- ── Fridge Items ──────────────────────────────────────────────────────────────
create policy "Household members can read/manage fridge"
  on fridge_items for all using (
    household_id in (select household_id from profiles where id = auth.uid())
  );


-- ══════════════════════════════════════════════════════════════════════════════
-- REALTIME  (enable for shared household tables)
-- ══════════════════════════════════════════════════════════════════════════════
-- Run these in Supabase Dashboard → Database → Replication
-- or via: alter publication supabase_realtime add table <table>;

-- Tables to enable:
--   grocery_items   ← real-time grocery list sync
--   fridge_items    ← real-time fridge sync
--   recipes         ← real-time recipe library sync

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — your schema is live. Next: create a project in supabase.com,
-- paste this into the SQL Editor, and set your EXPO_PUBLIC_SUPABASE_URL
-- and EXPO_PUBLIC_SUPABASE_ANON_KEY in screens/.env
-- ═══════════════════════════════════════════════════════════════════════════════
