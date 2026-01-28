-- Create a table for public profiles
create table public.users (
  id uuid references auth.users not null primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('STUDENT', 'PROCTOR')),
  is_approved boolean default false,
  registration_date timestamp with time zone default timezone('utc', now())
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies for users
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Create assignments table
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  proctor_id uuid references public.users(id) not null,
  title text not null,
  instructions text,
  questions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc', now()),
  status text check (status in ('DRAFT', 'ACTIVE', 'ARCHIVED')) default 'DRAFT'
);

alter table public.assignments enable row level security;

create policy "Assignments are viewable by everyone."
  on public.assignments for select
  using ( true );

create policy "Proctors can insert assignments."
  on public.assignments for insert
  with check ( auth.uid() = proctor_id );

create policy "Proctors can update their own assignments."
  on public.assignments for update
  using ( auth.uid() = proctor_id );

-- Create submissions table
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.assignments(id) not null,
  student_id uuid references public.users(id) not null,
  student_name text not null,
  answers jsonb default '[]'::jsonb,
  feedback text,
  score numeric,
  submitted_at timestamp with time zone default timezone('utc', now()),
  status text check (status in ('DRAFT', 'SUBMITTED', 'GRADED')) default 'DRAFT',
  draft_file_data text,
  draft_file_name text
);

alter table public.submissions enable row level security;

create policy "Users can see their own submissions."
  on public.submissions for select
  using ( auth.uid() = student_id );

create policy "Proctors can see submissions for their assignments."
  on public.submissions for select
  using ( 
    exists (
      select 1 from public.assignments
      where public.assignments.id = submissions.task_id
      and public.assignments.proctor_id = auth.uid()
    )
  );

create policy "Students can insert their own submissions."
  on public.submissions for insert
  with check ( auth.uid() = student_id );

create policy "Students can update their own submissions."
  on public.submissions for update
  using ( auth.uid() = student_id );

create policy "Proctors can update submissions (grade them)."
  on public.submissions for update
  using ( 
    exists (
      select 1 from public.assignments
      where public.assignments.id = submissions.task_id
      and public.assignments.proctor_id = auth.uid()
    )
  );
