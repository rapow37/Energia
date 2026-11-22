-- ENERGIA MASTER DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Run this in Supabase SQL Editor

-- 1. Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile automatically on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Siswa ENERGIA'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT DEFAULT 'Fisika SMA',
  grade TEXT DEFAULT 'Kelas 10',
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create classes"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());

-- 3. Class Members
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members viewable by class teachers and member students"
  ON public.class_members FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.classes WHERE classes.id = class_members.class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Students can join class"
  ON public.class_members FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- 4. Learning Modules
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  topic TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 25,
  total_missions INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules viewable by authenticated users"
  ON public.learning_modules FOR SELECT
  TO authenticated
  USING (true);

-- 5. Student Progress
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student view and update own progress"
  ON public.student_progress FOR ALL
  TO authenticated
  USING (student_id = auth.uid());

-- 6. Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable by class students and teacher"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.class_members WHERE class_members.class_id = assignments.class_id AND class_members.student_id = auth.uid())
  );

CREATE POLICY "Teacher can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());

-- 7. Assignment Submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'GRADED', 'LATE')),
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Submissions viewable by student and teacher"
  ON public.assignment_submissions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.teacher_id = auth.uid())
  );

CREATE POLICY "Students can submit assignment"
  ON public.assignment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- 8. Game Sessions (Classroom Battle)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  join_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'COUNTDOWN', 'QUESTION_ACTIVE', 'QUESTION_RESULT', 'LEADERBOARD', 'COMPLETED', 'CANCELLED')),
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions viewable by authenticated users"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Host can update sessions"
  ON public.game_sessions FOR ALL
  TO authenticated
  USING (host_id = auth.uid());

-- 9. Session Participants
CREATE TABLE IF NOT EXISTS public.session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants viewable by session members"
  ON public.session_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can join session"
  ON public.session_participants FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- 10. Achievements & Badges
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  icon_name TEXT NOT NULL
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements viewable by all"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student achievements viewable by all"
  ON public.student_achievements FOR SELECT
  TO authenticated
  USING (true);
