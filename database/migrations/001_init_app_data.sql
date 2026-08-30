-- Create app_data table for storing user dashboard data as JSON
CREATE TABLE IF NOT EXISTS app_data (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Create policies (optional: adjust based on your auth setup)
-- Allow users to read and update their own data
CREATE POLICY "Users can read own data"
  ON app_data FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update own data"
  ON app_data FOR UPDATE
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert own data"
  ON app_data FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Create separate tables for more structured queries (optional)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  member_id TEXT UNIQUE NOT NULL,
  plan TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  status TEXT DEFAULT 'normal',
  trend TEXT DEFAULT 'stable',
  normal_range TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vitals_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  heart INT,
  bp INT,
  spo2 INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  refill TEXT,
  status TEXT DEFAULT 'On track',
  accent TEXT DEFAULT 'positive',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sum_insured TEXT,
  cover TEXT,
  network TEXT,
  renewal TEXT,
  status TEXT DEFAULT 'Active',
  accent TEXT DEFAULT 'text-positive',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
CREATE POLICY "Users can read own profiles"
  ON profiles FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can read own vitals"
  ON vitals FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can read own vitals history"
  ON vitals_history FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can read own prescriptions"
  ON prescriptions FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can read own policies"
  ON policies FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Insert default app data for demo/testing
INSERT INTO app_data (id, data) VALUES (
  'dashboard-data',
  jsonb_build_object(
    'profile', jsonb_build_object(
      'name', 'Arjun Mehta',
      'email', 'arjun.mehta@mediclaim.app',
      'memberId', 'MC-2026-1842',
      'plan', 'Premium Health Care',
      'phone', '+91 98765 43210'
    ),
    'vitals', jsonb_build_array(
      jsonb_build_object(
        'id', 'vital-hr',
        'label', 'Heart Rate',
        'value', '76',
        'unit', 'bpm',
        'trend', 'stable',
        'trendValue', '+2 bpm vs yesterday',
        'status', 'normal',
        'normalRange', '60–100 bpm',
        'lastUpdated', '6 min ago'
      ),
      jsonb_build_object(
        'id', 'vital-bp',
        'label', 'Blood Pressure',
        'value', '128/83',
        'unit', 'mmHg',
        'trend', 'up',
        'trendValue', '+3 vs 7-day avg',
        'status', 'warning',
        'normalRange', '<120/80 mmHg',
        'lastUpdated', '6 min ago'
      ),
      jsonb_build_object(
        'id', 'vital-spo2',
        'label', 'SpO₂',
        'value', '97',
        'unit', '%',
        'trend', 'stable',
        'trendValue', 'Stable 3 days',
        'status', 'normal',
        'normalRange', '95–100%',
        'lastUpdated', '6 min ago'
      ),
      jsonb_build_object(
        'id', 'vital-glucose',
        'label', 'Blood Glucose',
        'value', '112',
        'unit', 'mg/dL',
        'trend', 'down',
        'trendValue', '−8 vs yesterday',
        'status', 'warning',
        'normalRange', '70–99 mg/dL',
        'lastUpdated', '2 hrs ago'
      ),
      jsonb_build_object(
        'id', 'vital-bmi',
        'label', 'BMI',
        'value', '26.4',
        'unit', 'kg/m²',
        'trend', 'down',
        'trendValue', '−0.3 this month',
        'status', 'warning',
        'normalRange', '18.5–24.9',
        'lastUpdated', 'Today'
      ),
      jsonb_build_object(
        'id', 'vital-sleep',
        'label', 'Sleep Duration',
        'value', '6.8',
        'unit', 'hrs',
        'trend', 'up',
        'trendValue', '+0.5 hrs vs last week',
        'status', 'normal',
        'normalRange', '7–9 hrs/night',
        'lastUpdated', 'This morning'
      )
    ),
    'vitalsHistory', jsonb_build_array(
      jsonb_build_object('date', '05 Aug', 'heart', 74, 'bp', 118, 'spo2', 97),
      jsonb_build_object('date', '08 Aug', 'heart', 76, 'bp', 121, 'spo2', 98),
      jsonb_build_object('date', '11 Aug', 'heart', 71, 'bp', 117, 'spo2', 99),
      jsonb_build_object('date', '14 Aug', 'heart', 78, 'bp', 126, 'spo2', 97),
      jsonb_build_object('date', '17 Aug', 'heart', 73, 'bp', 120, 'spo2', 98),
      jsonb_build_object('date', '20 Aug', 'heart', 75, 'bp', 123, 'spo2', 98),
      jsonb_build_object('date', '23 Aug', 'heart', 80, 'bp', 129, 'spo2', 96),
      jsonb_build_object('date', '26 Aug', 'heart', 77, 'bp', 124, 'spo2', 97),
      jsonb_build_object('date', '29 Aug', 'heart', 76, 'bp', 122, 'spo2', 98)
    ),
    'activity', jsonb_build_array(
      jsonb_build_object('day', 'Mon', 'steps', 7420, 'goal', 8000),
      jsonb_build_object('day', 'Tue', 'steps', 9150, 'goal', 8000),
      jsonb_build_object('day', 'Wed', 'steps', 5830, 'goal', 8000),
      jsonb_build_object('day', 'Thu', 'steps', 8640, 'goal', 8000),
      jsonb_build_object('day', 'Fri', 'steps', 6290, 'goal', 8000),
      jsonb_build_object('day', 'Sat', 'steps', 11200, 'goal', 8000),
      jsonb_build_object('day', 'Sun', 'steps', 4180, 'goal', 8000)
    ),
    'prescriptions', jsonb_build_array(
      jsonb_build_object(
        'name', 'Atorvastatin 20mg',
        'dosage', '1 tablet daily',
        'refill', 'Refill due in 6 days',
        'status', 'On track',
        'accent', 'positive'
      ),
      jsonb_build_object(
        'name', 'Vitamin D3 60K IU',
        'dosage', '1 capsule weekly',
        'refill', 'Refill due in 14 days',
        'status', 'On track',
        'accent', 'positive'
      ),
      jsonb_build_object(
        'name', 'Metformin 500mg',
        'dosage', '1 tablet twice daily',
        'refill', 'Filled 2 days ago',
        'status', 'Updated',
        'accent', 'info'
      ),
      jsonb_build_object(
        'name', 'Cough Syrup',
        'dosage', '5 ml after meals',
        'refill', 'Completed',
        'status', 'Completed',
        'accent', 'warning'
      )
    ),
    'policies', jsonb_build_array(
      jsonb_build_object(
        'name', 'MediCare Plus',
        'sumInsured', '₹10,00,000',
        'cover', '90%',
        'network', 'In-network coverage',
        'renewal', 'Renews in 18 days',
        'status', 'Active',
        'accent', 'text-positive'
      ),
      jsonb_build_object(
        'name', 'Secure Health Pro',
        'sumInsured', '₹7,50,000',
        'cover', '85%',
        'network', 'Hospitalization benefit',
        'renewal', 'Renews in 76 days',
        'status', 'Active',
        'accent', 'text-info'
      ),
      jsonb_build_object(
        'name', 'Family Care Shield',
        'sumInsured', '₹5,00,000',
        'cover', '78%',
        'network', 'Cashless available',
        'renewal', 'Renews in 120 days',
        'status', 'Grace period',
        'accent', 'text-warning'
      )
    )
  )
) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now();
