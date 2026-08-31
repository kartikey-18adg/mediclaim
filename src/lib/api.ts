import { getSupabaseClient } from './supabase';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  distance: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  primarySpecialty: string;
  bedsAvailable: number;
  totalBeds: number;
  claimAcceptanceRate: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  outOfPocketMin: number;
  outOfPocketMax: number;
  accreditations: ('NABH' | 'JCI' | 'NABL')[];
  inNetwork: boolean;
  emergencyAvailable: boolean;
  waitTime: string;
  matchScore: number;
  insurance: string[];
  type: 'Multi-Specialty' | 'Super-Specialty' | 'Specialty' | 'Government';
  phone: string;
}

export type DocCategory = 'lab_report' | 'prescription' | 'bill' | 'discharge_summary';
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ExtractedField {
  label: string;
  value: string;
}

export interface MedicalDocument {
  id: string;
  name: string;
  category: DocCategory;
  size: string;
  uploadedAt: string;
  status: ProcessingStatus;
  progress: number;
  fileType: 'pdf' | 'image';
  previewUrl?: string;
  extractedFields?: ExtractedField[];
  errorMessage?: string;
  patientName?: string;
  docDate?: string;
}

export interface ClaimSourceDocument {
  id: string;
  name: string;
  type: 'discharge_summary' | 'bill' | 'lab_report' | 'prescription';
  date: string;
  confidence: number;
}

export interface ClaimExtractedField {
  key: string;
  label: string;
  value: string;
  editable: boolean;
  category: 'patient' | 'treatment' | 'financial' | 'hospital';
}

export interface InsurancePlan {
  id: string;
  planName: string;
  insurer: string;
  policyNumber: string;
  planType: string;
  sumInsured: number;
  coveragePercent: number;
  coveredAmount: number;
  deductible: number;
  copay: number;
  outOfPocket: number;
  claimApprovalRate: number;
  networkHospital: boolean;
  color: string;
  accentColor: string;
  ringColor: string;
  isBest?: boolean;
  notes: string[];
}

interface HospitalRow {
  id: string;
  name: string;
  location: string;
  city: string;
  distance: number;
  rating: number;
  review_count: number;
  specialties: string[] | null;
  primary_specialty: string | null;
  beds_available: number;
  total_beds: number;
  claim_acceptance_rate: number;
  estimated_cost_min: number;
  estimated_cost_max: number;
  out_of_pocket_min: number;
  out_of_pocket_max: number;
  accreditations: string[] | null;
  in_network: boolean;
  emergency_available: boolean;
  wait_time: string | null;
  match_score: number;
  insurance: string[] | null;
  type: string;
  phone: string | null;
}

interface MedicalDocumentRow {
  id: string;
  name: string;
  category: string;
  size: string | null;
  uploaded_at: string;
  status: string;
  progress: number;
  file_type: string;
  patient_name: string | null;
  doc_date: string | null;
  extracted_fields: ExtractedField[] | null;
  error_message: string | null;
}

interface ClaimSourceDocumentRow {
  id: string;
  name: string;
  type: string;
  doc_date: string | null;
  confidence: number;
}

interface ClaimExtractedFieldRow {
  field_key: string;
  label: string;
  value: string;
  editable: boolean;
  category: string;
  sort_order: number;
}

interface InsurancePlanRow {
  id: string;
  plan_name: string;
  insurer: string;
  policy_number: string | null;
  plan_type: string | null;
  sum_insured: number;
  coverage_percent: number;
  covered_amount: number;
  deductible: number;
  copay: number;
  out_of_pocket: number;
  claim_approval_rate: number;
  network_hospital: boolean;
  color: string | null;
  accent_color: string | null;
  ring_color: string | null;
  is_best: boolean;
  notes: string[] | null;
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
    this.name = 'SupabaseNotConfiguredError';
  }
}

async function selectRows<Row>(
  table: string,
  orderBy: { column: string; ascending: boolean }
): Promise<Row[]> {
  const client = getSupabaseClient();

  if (!client) {
    throw new SupabaseNotConfiguredError();
  }

  const { data, error } = await client
    .from(table)
    .select('*')
    .order(orderBy.column, { ascending: orderBy.ascending });

  if (error) {
    throw new Error(`Could not load ${table.replace(/_/g, ' ')}: ${error.message}`);
  }

  return (data ?? []) as Row[];
}

export async function fetchHospitals(): Promise<Hospital[]> {
  const rows = await selectRows<HospitalRow>('hospitals', {
    column: 'match_score',
    ascending: false,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    location: row.location,
    city: row.city,
    distance: Number(row.distance),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    specialties: row.specialties ?? [],
    primarySpecialty: row.primary_specialty ?? '',
    bedsAvailable: row.beds_available,
    totalBeds: row.total_beds,
    claimAcceptanceRate: row.claim_acceptance_rate,
    estimatedCostMin: row.estimated_cost_min,
    estimatedCostMax: row.estimated_cost_max,
    outOfPocketMin: row.out_of_pocket_min,
    outOfPocketMax: row.out_of_pocket_max,
    accreditations: (row.accreditations ?? []) as Hospital['accreditations'],
    inNetwork: row.in_network,
    emergencyAvailable: row.emergency_available,
    waitTime: row.wait_time ?? '—',
    matchScore: row.match_score,
    insurance: row.insurance ?? [],
    type: row.type as Hospital['type'],
    phone: row.phone ?? '',
  }));
}

export async function fetchMedicalDocuments(): Promise<MedicalDocument[]> {
  const rows = await selectRows<MedicalDocumentRow>('medical_documents', {
    column: 'uploaded_at',
    ascending: false,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as DocCategory,
    size: row.size ?? '—',
    uploadedAt: row.uploaded_at,
    status: row.status as ProcessingStatus,
    progress: row.progress,
    fileType: row.file_type === 'image' ? 'image' : 'pdf',
    extractedFields: row.extracted_fields ?? undefined,
    errorMessage: row.error_message ?? undefined,
    patientName: row.patient_name ?? undefined,
    docDate: row.doc_date ?? undefined,
  }));
}

export async function fetchClaimSourceDocuments(): Promise<ClaimSourceDocument[]> {
  const rows = await selectRows<ClaimSourceDocumentRow>('claim_source_documents', {
    column: 'confidence',
    ascending: false,
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type as ClaimSourceDocument['type'],
    date: row.doc_date ?? '',
    confidence: row.confidence,
  }));
}

export async function fetchClaimExtractedFields(): Promise<ClaimExtractedField[]> {
  const rows = await selectRows<ClaimExtractedFieldRow>('claim_extracted_fields', {
    column: 'sort_order',
    ascending: true,
  });

  return rows.map((row) => ({
    key: row.field_key,
    label: row.label,
    value: row.value,
    editable: row.editable,
    category: row.category as ClaimExtractedField['category'],
  }));
}

export async function fetchInsurancePlans(): Promise<InsurancePlan[]> {
  const rows = await selectRows<InsurancePlanRow>('insurance_plans', {
    column: 'coverage_percent',
    ascending: false,
  });

  return rows.map((row) => ({
    id: row.id,
    planName: row.plan_name,
    insurer: row.insurer,
    policyNumber: row.policy_number ?? '',
    planType: row.plan_type ?? '',
    sumInsured: row.sum_insured,
    coveragePercent: row.coverage_percent,
    coveredAmount: row.covered_amount,
    deductible: row.deductible,
    copay: row.copay,
    outOfPocket: row.out_of_pocket,
    claimApprovalRate: row.claim_approval_rate,
    networkHospital: row.network_hospital,
    color: row.color ?? 'from-slate-50 to-slate-100',
    accentColor: row.accent_color ?? 'text-primary',
    ringColor: row.ring_color ?? 'ring-primary/40',
    isBest: row.is_best,
    notes: row.notes ?? [],
  }));
}
