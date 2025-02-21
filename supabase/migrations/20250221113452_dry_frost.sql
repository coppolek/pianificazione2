/*
  # Work Sites Management Schema

  1. New Tables
    - `work_sites`
      - Basic information about work sites
      - Address and GPS coordinates
      - Contact information
    - `work_site_schedules`
      - Time slots for each work site
      - Links to operators assigned to each slot
    - `work_site_operators`
      - Junction table for operators assigned to time slots
    - `work_site_history`
      - Tracks all changes made to work sites
  
  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
*/

-- Work Sites table
CREATE TABLE IF NOT EXISTS work_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  street_address text NOT NULL,
  street_number text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  latitude numeric(10,8),
  longitude numeric(11,8),
  contact_name text NOT NULL,
  primary_phone text NOT NULL,
  secondary_phone text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Work Site Schedules table
CREATE TABLE IF NOT EXISTS work_site_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_site_id uuid REFERENCES work_sites(id) ON DELETE CASCADE,
  day_of_week text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Work Site Operators junction table
CREATE TABLE IF NOT EXISTS work_site_operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES work_site_schedules(id) ON DELETE CASCADE,
  operator_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Work Site History table
CREATE TABLE IF NOT EXISTS work_site_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_site_id uuid REFERENCES work_sites(id) ON DELETE CASCADE,
  changed_by uuid NOT NULL,
  change_type text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE work_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_site_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_site_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_site_history ENABLE ROW LEVEL SECURITY;

-- Policies for work_sites
CREATE POLICY "Users can view all work sites"
  ON work_sites
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert work sites"
  ON work_sites
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update work sites"
  ON work_sites
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for work_site_schedules
CREATE POLICY "Users can view all schedules"
  ON work_site_schedules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage schedules"
  ON work_site_schedules
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for work_site_operators
CREATE POLICY "Users can view all operator assignments"
  ON work_site_operators
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage operator assignments"
  ON work_site_operators
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for work_site_history
CREATE POLICY "Users can view history"
  ON work_site_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert history"
  ON work_site_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_work_site_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_work_site_timestamp
  BEFORE UPDATE ON work_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_work_site_timestamp();