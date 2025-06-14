-- DAINAGE Toggl Clone Database Schema
-- This SQL should be executed in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE task_type AS ENUM ('feature', 'bug', 'review', 'meeting', 'research', 'testing', 'deployment', 'other');
CREATE TYPE team_role AS ENUM ('member', 'lead', 'admin');
CREATE TYPE sprint_status AS ENUM ('planning', 'active', 'completed', 'cancelled');
CREATE TYPE sprint_task_status AS ENUM ('todo', 'in_progress', 'review', 'done');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'Asia/Tokyo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role team_role DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    task_type task_type DEFAULT 'other',
    git_branch TEXT,
    git_commit TEXT,
    external_ticket_id TEXT,
    external_ticket_url TEXT,
    estimated_hours DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time entries table
CREATE TABLE time_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    is_running BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: only one running timer per user
    CONSTRAINT one_running_timer_per_user EXCLUDE (user_id WITH =) WHERE (is_running = TRUE)
);

-- Sprints table
CREATE TABLE sprints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    goal TEXT,
    status sprint_status DEFAULT 'planning',
    velocity_points INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: start_date must be before end_date
    CONSTRAINT valid_sprint_dates CHECK (start_date < end_date)
);

-- Sprint tasks table
CREATE TABLE sprint_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    story_points INTEGER,
    status sprint_task_status DEFAULT 'todo',
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(sprint_id, task_id)
);

-- Git integrations table
CREATE TABLE git_integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('github', 'gitlab', 'bitbucket')),
    repository_url TEXT NOT NULL,
    access_token TEXT NOT NULL,
    webhook_secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External tickets table
CREATE TABLE external_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('jira', 'github', 'linear', 'asana')),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    assignee TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, external_id)
);

-- Create indexes for better performance
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_time_entries_is_running ON time_entries(is_running) WHERE is_running = TRUE;
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_tickets_updated_at BEFORE UPDATE ON external_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate duration when time entry is stopped
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- If end_time is being set and duration is not manually provided
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL AND NEW.duration IS NULL THEN
        NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
        NEW.is_running = FALSE;
    END IF;
    
    -- If is_running is set to FALSE, set end_time to NOW if not already set
    IF NEW.is_running = FALSE AND OLD.is_running = TRUE AND NEW.end_time IS NULL THEN
        NEW.end_time = NOW();
        NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_duration_trigger 
BEFORE UPDATE ON time_entries 
FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for automatic user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE git_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_tickets ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (
    auth.uid() = user_id OR 
    team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (
    auth.uid() = user_id OR 
    team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('lead', 'admin')
    )
);

CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view tasks in accessible projects" ON tasks FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        user_id = auth.uid() OR 
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can create tasks in accessible projects" ON tasks FOR INSERT WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE 
        user_id = auth.uid() OR 
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can update tasks in accessible projects" ON tasks FOR UPDATE USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        user_id = auth.uid() OR 
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can delete tasks in accessible projects" ON tasks FOR DELETE USING (
    project_id IN (
        SELECT id FROM projects WHERE 
        user_id = auth.uid() OR 
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('lead', 'admin'))
    )
);

-- Time entries policies
CREATE POLICY "Users can view own time entries" ON time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own time entries" ON time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time entries" ON time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time entries" ON time_entries FOR DELETE USING (auth.uid() = user_id);

-- Team access policies
CREATE POLICY "Users can view teams they belong to" ON teams FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

CREATE POLICY "Team admins can update teams" ON teams FOR UPDATE USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view team members of their teams" ON team_members FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Sprint policies
CREATE POLICY "Team members can view sprints" ON sprints FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

CREATE POLICY "Team leads can manage sprints" ON sprints FOR ALL USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('lead', 'admin'))
);

-- Git integrations policies
CREATE POLICY "Users can manage own git integrations" ON git_integrations FOR ALL USING (auth.uid() = user_id);

-- External tickets policies (read-only for now)
CREATE POLICY "Users can view external tickets" ON external_tickets FOR SELECT USING (true);

-- Create views for common queries

-- Active time entries view
CREATE VIEW active_time_entries AS
SELECT 
    te.*,
    p.name as project_name,
    p.color as project_color,
    t.name as task_name,
    t.task_type
FROM time_entries te
LEFT JOIN projects p ON te.project_id = p.id
LEFT JOIN tasks t ON te.task_id = t.id
WHERE te.is_running = true;

-- Daily time summary view
CREATE VIEW daily_time_summary AS
SELECT 
    user_id,
    DATE(start_time AT TIME ZONE 'UTC') as date,
    SUM(duration) as total_duration,
    COUNT(*) as entries_count,
    array_agg(DISTINCT project_id) as projects
FROM time_entries
WHERE duration IS NOT NULL
GROUP BY user_id, DATE(start_time AT TIME ZONE 'UTC');

-- Project time summary view
CREATE VIEW project_time_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.color as project_color,
    p.user_id,
    COUNT(te.id) as entries_count,
    COALESCE(SUM(te.duration), 0) as total_duration,
    DATE(MIN(te.start_time)) as first_entry_date,
    DATE(MAX(te.start_time)) as last_entry_date
FROM projects p
LEFT JOIN time_entries te ON p.id = te.project_id AND te.duration IS NOT NULL
GROUP BY p.id, p.name, p.color, p.user_id;

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;

-- Insert some sample task types for development
INSERT INTO tasks (id, project_id, name, task_type) VALUES 
(uuid_generate_v4(), uuid_generate_v4(), 'Sample Feature Task', 'feature'),
(uuid_generate_v4(), uuid_generate_v4(), 'Sample Bug Fix', 'bug'),
(uuid_generate_v4(), uuid_generate_v4(), 'Sample Code Review', 'review')
ON CONFLICT DO NOTHING;