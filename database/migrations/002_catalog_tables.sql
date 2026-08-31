-- Tables backing the hospital finder, medical documents and claims workflow pages.
-- Read-only for anonymous clients; writes require a privileged role.

CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  distance NUMERIC NOT NULL,
  rating NUMERIC NOT NULL,
  review_count INT NOT NULL DEFAULT 0,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  primary_specialty TEXT,
  beds_available INT NOT NULL DEFAULT 0,
  total_beds INT NOT NULL DEFAULT 0,
  claim_acceptance_rate INT NOT NULL DEFAULT 0,
  estimated_cost_min INT NOT NULL DEFAULT 0,
  estimated_cost_max INT NOT NULL DEFAULT 0,
  out_of_pocket_min INT NOT NULL DEFAULT 0,
  out_of_pocket_max INT NOT NULL DEFAULT 0,
  accreditations TEXT[] NOT NULL DEFAULT '{}',
  in_network BOOLEAN NOT NULL DEFAULT false,
  emergency_available BOOLEAN NOT NULL DEFAULT false,
  wait_time TEXT,
  match_score INT NOT NULL DEFAULT 0,
  insurance TEXT[] NOT NULL DEFAULT '{}',
  type TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_documents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'queued',
  progress INT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  patient_name TEXT,
  doc_date TEXT,
  extracted_fields JSONB,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS claim_source_documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  doc_date TEXT,
  confidence INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS claim_extracted_fields (
  field_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  editable BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS insurance_plans (
  id TEXT PRIMARY KEY,
  plan_name TEXT NOT NULL,
  insurer TEXT NOT NULL,
  policy_number TEXT,
  plan_type TEXT,
  sum_insured INT NOT NULL DEFAULT 0,
  coverage_percent INT NOT NULL DEFAULT 0,
  covered_amount INT NOT NULL DEFAULT 0,
  deductible INT NOT NULL DEFAULT 0,
  copay INT NOT NULL DEFAULT 0,
  out_of_pocket INT NOT NULL DEFAULT 0,
  claim_approval_rate INT NOT NULL DEFAULT 0,
  network_hospital BOOLEAN NOT NULL DEFAULT false,
  color TEXT,
  accent_color TEXT,
  ring_color TEXT,
  is_best BOOLEAN NOT NULL DEFAULT false,
  notes TEXT[] NOT NULL DEFAULT '{}'
);

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['hospitals', 'claim_source_documents', 'claim_extracted_fields', 'insurance_plans'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read %1$s" ON %1$I', t);
    EXECUTE format('CREATE POLICY "Public read %1$s" ON %1$I FOR SELECT USING (true)', t);
  END LOOP;
END
$$;

DROP POLICY IF EXISTS "Read own documents" ON medical_documents;
CREATE POLICY "Read own documents"
  ON medical_documents FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Seed data (mirrors what the UI previously hardcoded)

INSERT INTO hospitals (id, name, location, city, distance, rating, review_count, specialties, primary_specialty, beds_available, total_beds, claim_acceptance_rate, estimated_cost_min, estimated_cost_max, out_of_pocket_min, out_of_pocket_max, accreditations, in_network, emergency_available, wait_time, match_score, insurance, type, phone) VALUES
  ('hosp-apollo-navi', 'Apollo Hospitals', 'Belapur, Navi Mumbai', 'Navi Mumbai', 3.2, 4.7, 3842, ARRAY['Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Nephrology']::text[], 'Cardiology', 24, 320, 96, 42000, 68000, 1680, 2720, ARRAY['NABH', 'JCI', 'NABL']::text[], true, true, '15–20 min', 97, ARRAY['Star Health', 'HDFC ERGO', 'Bajaj Allianz', 'New India']::text[], 'Multi-Specialty', '+91 22 2756 0000'),
  ('hosp-fortis-pune', 'Fortis Hiranandani Hospital', 'Vashi, Navi Mumbai', 'Navi Mumbai', 5.8, 4.5, 2194, ARRAY['Cardiology', 'Pulmonology', 'Endocrinology', 'Gastroenterology']::text[], 'Pulmonology', 8, 180, 92, 38000, 55000, 3040, 4400, ARRAY['NABH', 'NABL']::text[], true, true, '25–35 min', 89, ARRAY['Star Health', 'HDFC ERGO', 'Religare']::text[], 'Multi-Specialty', '+91 22 2518 2222'),
  ('hosp-kokilaben', 'Kokilaben Dhirubhai Ambani Hospital', 'Andheri West, Mumbai', 'Mumbai', 12.4, 4.8, 5621, ARRAY['Cardiology', 'Neurology', 'Oncology', 'Transplant', 'Robotics Surgery']::text[], 'Cardiology', 42, 750, 98, 65000, 120000, 1300, 2400, ARRAY['NABH', 'JCI']::text[], true, true, '10–15 min', 94, ARRAY['Star Health', 'HDFC ERGO', 'Bajaj Allianz', 'ICICI Lombard', 'New India']::text[], 'Super-Specialty', '+91 22 4269 6969'),
  ('hosp-wockhardt-mira', 'Wockhardt Hospital', 'Mira Road, Thane', 'Thane', 18.7, 4.2, 1087, ARRAY['Cardiology', 'Orthopedics', 'Gynecology', 'Pediatrics']::text[], 'Orthopedics', 3, 120, 84, 28000, 45000, 4480, 7200, ARRAY['NABH']::text[], false, true, '40–60 min', 71, ARRAY['Bajaj Allianz', 'New India', 'Oriental']::text[], 'Multi-Specialty', '+91 22 2811 0000'),
  ('hosp-nanavati', 'Nanavati Max Super Speciality', 'Vile Parle West, Mumbai', 'Mumbai', 9.1, 4.4, 2876, ARRAY['Cardiology', 'Endocrinology', 'Neurology', 'Urology', 'Bariatric Surgery']::text[], 'Endocrinology', 16, 350, 91, 48000, 75000, 4320, 6750, ARRAY['NABH', 'JCI']::text[], true, true, '20–30 min', 85, ARRAY['Star Health', 'HDFC ERGO', 'Bajaj Allianz', 'Religare']::text[], 'Super-Specialty', '+91 22 2626 7500'),
  ('hosp-sir-hh', 'Sir H.N. Reliance Foundation Hospital', 'Girgaon, Mumbai', 'Mumbai', 14.2, 4.6, 1934, ARRAY['Cardiology', 'Oncology', 'Nephrology', 'Transplant', 'Pulmonology']::text[], 'Cardiology', 31, 345, 94, 52000, 88000, 3120, 5280, ARRAY['NABH', 'NABL']::text[], true, true, '20–25 min', 88, ARRAY['Star Health', 'ICICI Lombard', 'Bajaj Allianz']::text[], 'Super-Specialty', '+91 22 6175 0000'),
  ('hosp-mgm-vashi', 'MGM Healthcare', 'Sector 3, Vashi', 'Navi Mumbai', 4.5, 4.1, 743, ARRAY['General Medicine', 'Cardiology', 'Orthopedics', 'ENT']::text[], 'General Medicine', 12, 90, 78, 18000, 32000, 3960, 7040, ARRAY['NABH']::text[], false, false, '30–45 min', 62, ARRAY['New India', 'Oriental']::text[], 'Specialty', '+91 22 2778 6666'),
  ('hosp-lilavati', 'Lilavati Hospital & Research Centre', 'Bandra West, Mumbai', 'Mumbai', 11.3, 4.5, 3201, ARRAY['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Gastroenterology']::text[], 'Neurology', 19, 323, 93, 44000, 72000, 3080, 5040, ARRAY['NABH', 'NABL']::text[], true, true, '20–30 min', 82, ARRAY['Star Health', 'HDFC ERGO', 'Bajaj Allianz', 'New India', 'Religare']::text[], 'Multi-Specialty', '+91 22 2675 1000')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_documents (id, name, category, size, uploaded_at, status, progress, file_type, patient_name, doc_date, extracted_fields, error_message) VALUES
  ('doc-001', 'CBC_BloodTest_July2025.pdf', 'lab_report', '1.2 MB', '2025-07-18T09:30:00', 'completed', 100, 'pdf', 'Arjun Mehta', '18 Jul 2025', '[{"label":"Test Name","value":"Complete Blood Count (CBC)"},{"label":"Haemoglobin","value":"13.8 g/dL (Normal)"},{"label":"WBC Count","value":"7,200 /µL (Normal)"},{"label":"Platelet Count","value":"2.1 Lakh /µL (Normal)"},{"label":"Lab Name","value":"SRL Diagnostics, Mumbai"},{"label":"Referred By","value":"Dr. Priya Sharma"}]'::jsonb, NULL),
  ('doc-002', 'Apollo_Discharge_Summary.pdf', 'discharge_summary', '3.4 MB', '2025-07-10T14:15:00', 'completed', 100, 'pdf', 'Arjun Mehta', '10 Jul 2025', '[{"label":"Hospital","value":"Apollo Hospitals, Mumbai"},{"label":"Admission Date","value":"05 Jul 2025"},{"label":"Discharge Date","value":"10 Jul 2025"},{"label":"Diagnosis","value":"Acute Appendicitis"},{"label":"Procedure","value":"Laparoscopic Appendectomy"},{"label":"Attending Surgeon","value":"Dr. Rajesh Nair"}]'::jsonb, NULL),
  ('doc-003', 'Hospital_Bill_Apollo_July.pdf', 'bill', '0.8 MB', '2025-07-10T16:00:00', 'completed', 100, 'pdf', 'Arjun Mehta', '10 Jul 2025', '[{"label":"Hospital","value":"Apollo Hospitals, Mumbai"},{"label":"Bill No.","value":"APL-2025-07-8821"},{"label":"Total Amount","value":"₹58,400"},{"label":"Insurance Covered","value":"₹52,560 (90%)"},{"label":"Patient Payable","value":"₹5,840"},{"label":"GST","value":"₹1,050"}]'::jsonb, NULL),
  ('doc-004', 'Prescription_PostOp_Nair.jpg', 'prescription', '0.5 MB', '2025-07-11T10:00:00', 'processing', 62, 'image', 'Arjun Mehta', '11 Jul 2025', NULL, NULL),
  ('doc-005', 'Lipid_Panel_June2025.pdf', 'lab_report', '0.9 MB', '2025-06-22T08:45:00', 'completed', 100, 'pdf', 'Arjun Mehta', '22 Jun 2025', '[{"label":"Test Name","value":"Lipid Profile Panel"},{"label":"Total Cholesterol","value":"198 mg/dL (Normal)"},{"label":"LDL","value":"122 mg/dL (Borderline)"},{"label":"HDL","value":"48 mg/dL (Normal)"},{"label":"Triglycerides","value":"142 mg/dL (Normal)"},{"label":"Lab Name","value":"Metropolis Healthcare, Pune"}]'::jsonb, NULL),
  ('doc-006', 'Scan_Report_Abdomen.pdf', 'lab_report', '4.1 MB', '2025-07-04T11:30:00', 'failed', 0, 'pdf', 'Arjun Mehta', '04 Jul 2025', NULL, 'File is password-protected. Please upload an unlocked version.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO claim_source_documents (id, name, type, doc_date, confidence) VALUES
  ('doc-002', 'Apollo_Discharge_Summary.pdf', 'discharge_summary', '10 Jul 2025', 97),
  ('doc-003', 'Hospital_Bill_Apollo_July.pdf', 'bill', '10 Jul 2025', 99),
  ('doc-001', 'CBC_BloodTest_July2025.pdf', 'lab_report', '18 Jul 2025', 94)
ON CONFLICT (id) DO NOTHING;

INSERT INTO claim_extracted_fields (field_key, label, value, editable, category, sort_order) VALUES
  ('patient_name', 'Patient Name', 'Arjun Mehta', true, 'patient', 0),
  ('dob', 'Date of Birth', '14 Mar 1990', true, 'patient', 1),
  ('policy_holder', 'Policy Holder', 'Arjun Mehta', true, 'patient', 2),
  ('hospital_name', 'Hospital Name', 'Apollo Hospitals, Mumbai', true, 'hospital', 3),
  ('hospital_address', 'Hospital Address', 'Parsik Hill Road, Belapur, Navi Mumbai', true, 'hospital', 4),
  ('admission_date', 'Admission Date', '05 Jul 2025', true, 'treatment', 5),
  ('discharge_date', 'Discharge Date', '10 Jul 2025', true, 'treatment', 6),
  ('diagnosis', 'Primary Diagnosis', 'Acute Appendicitis (K35.80)', true, 'treatment', 7),
  ('procedure', 'Procedure Performed', 'Laparoscopic Appendectomy', true, 'treatment', 8),
  ('attending_doctor', 'Attending Surgeon', 'Dr. Rajesh Nair (MCI: 45821)', true, 'treatment', 9),
  ('room_type', 'Room Type', 'Private Room', true, 'treatment', 10),
  ('total_bill', 'Total Bill Amount', '₹58,400', false, 'financial', 11),
  ('surgery_charges', 'Surgery Charges', '₹32,000', false, 'financial', 12),
  ('room_charges', 'Room & Nursing Charges', '₹12,500', false, 'financial', 13),
  ('medicine_charges', 'Medicine & Consumables', '₹8,900', false, 'financial', 14),
  ('diagnostic_charges', 'Diagnostic Charges', '₹5,000', false, 'financial', 15)
ON CONFLICT (field_key) DO NOTHING;

INSERT INTO insurance_plans (id, plan_name, insurer, policy_number, plan_type, sum_insured, coverage_percent, covered_amount, deductible, copay, out_of_pocket, claim_approval_rate, network_hospital, color, accent_color, ring_color, is_best, notes) VALUES
  ('plan-star', 'Star Health Comprehensive', 'Star Health & Allied Insurance', 'P/211221/01/2025/004821', 'Individual', 1000000, 90, 52560, 2920, 0, 5840, 94, true, 'from-teal-50 to-cyan-50', 'text-teal-600', 'ring-teal-400/50', true, ARRAY['Cashless at 14,000+ hospitals', 'No room rent sub-limit']::text[]),
  ('plan-hdfc', 'HDFC ERGO Optima Restore', 'HDFC ERGO General Insurance', 'HE-2025-IND-00934', 'Family Floater', 500000, 85, 49640, 2920, 2482, 11162, 91, true, 'from-blue-50 to-indigo-50', 'text-blue-600', 'ring-blue-400/50', false, ARRAY['Sum insured restored after each claim', 'Planned and emergency treatment covered']::text[]),
  ('plan-niva', 'Niva Bupa ReAssure 2.0', 'Niva Bupa Health Insurance', 'NB-RE2-2025-78341', 'Individual', 750000, 88, 51392, 2920, 2570, 9498, 89, true, 'from-violet-50 to-purple-50', 'text-violet-600', 'ring-violet-400/50', false, ARRAY['Lock the Clock benefit – premium stays same', 'Direct claim settlement']::text[]),
  ('plan-care', 'Care Supreme', 'Care Health Insurance', 'CHI-SUP-2025-11902', 'Individual', 600000, 87, 50808, 2920, 2540, 10552, 88, true, 'from-emerald-50 to-green-50', 'text-emerald-600', 'ring-emerald-400/50', false, ARRAY['Annual health check-up included', 'Unlimited restoration of sum insured']::text[])
ON CONFLICT (id) DO NOTHING;
