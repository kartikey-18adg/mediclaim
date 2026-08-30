'use client';

import React, { useState, useCallback } from 'react';
import {
  Calculator,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudUpload,
  X,
  TrendingDown,
  ShieldCheck,
  Wallet,
  Receipt,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type InputMode = 'manual' | 'upload';

interface TreatmentInput {
  treatmentType: string;
  hospitalType: string;
  estimatedCost: string;
  diagnosisCode: string;
  roomType: string;
  durationDays: string;
  preExisting: boolean;
  emergencyAdmission: boolean;
}

interface PlanResult {
  planName: string;
  insurer: string;
  planType: string;
  sumInsured: number;
  coveragePercent: number;
  coveredAmount: number;
  deductible: number;
  copay: number;
  outOfPocket: number;
  claimApprovalRate: number;
  networkHospital: boolean;
  notes: string[];
  color: string;
  accentColor: string;
}

interface UploadedFile {
  name: string;
  size: string;
  status: 'uploading' | 'parsed' | 'error';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const treatmentTypes = [
  'Cardiac Surgery',
  'Orthopaedic Surgery',
  'Cancer Treatment / Chemotherapy',
  'Kidney Dialysis',
  'Maternity & Delivery',
  'General Surgery',
  'ICU / Critical Care',
  'Diagnostic & Lab Tests',
  'Physiotherapy',
  'Dental Procedure',
  'Eye Surgery (Cataract / LASIK)',
  'Neurological Treatment',
  'Liver Transplant',
  'Other',
];

const hospitalTypes = [
  { value: 'network_tier1', label: 'Network Hospital – Tier 1 (Metro)' },
  { value: 'network_tier2', label: 'Network Hospital – Tier 2 (City)' },
  { value: 'non_network', label: 'Non-Network Hospital' },
  { value: 'government', label: 'Government Hospital' },
];

const roomTypes = [
  { value: 'general', label: 'General Ward' },
  { value: 'semi_private', label: 'Semi-Private Room' },
  { value: 'private', label: 'Private Room' },
  { value: 'icu', label: 'ICU / Critical Care' },
];

const defaultInput: TreatmentInput = {
  treatmentType: '',
  hospitalType: 'network_tier1',
  estimatedCost: '',
  diagnosisCode: '',
  roomType: 'semi_private',
  durationDays: '3',
  preExisting: false,
  emergencyAdmission: false,
};

// ─── Mock calculation engine ──────────────────────────────────────────────────

function calculateCoverage(input: TreatmentInput): PlanResult[] {
  const cost = parseFloat(input.estimatedCost.replace(/,/g, '')) || 0;
  const isNetwork = input.hospitalType !== 'non_network';
  const isPreExisting = input.preExisting;
  const isEmergency = input.emergencyAdmission;

  const plans: Omit<PlanResult, 'coveredAmount' | 'deductible' | 'copay' | 'outOfPocket'>[] = [
    {
      planName: 'Star Health Comprehensive',
      insurer: 'Star Health',
      planType: 'Individual',
      sumInsured: 1000000,
      coveragePercent: isNetwork ? (isPreExisting ? 70 : 90) : 60,
      claimApprovalRate: 94,
      networkHospital: isNetwork,
      notes: isPreExisting
        ? ['Pre-existing conditions covered after 2-yr waiting period', 'Cashless at 14,000+ hospitals']
        : ['Cashless at 14,000+ hospitals', 'No room rent sub-limit'],
      color: 'from-teal-50 to-cyan-50',
      accentColor: 'text-teal-600',
    },
    {
      planName: 'HDFC ERGO Optima Restore',
      insurer: 'HDFC ERGO',
      planType: 'Family Floater',
      sumInsured: 500000,
      coveragePercent: isNetwork ? (isPreExisting ? 65 : 85) : 55,
      claimApprovalRate: 91,
      networkHospital: isNetwork,
      notes: ['Sum insured restored after each claim', isEmergency ? 'Emergency cover included' : 'Planned treatment covered'],
      color: 'from-blue-50 to-indigo-50',
      accentColor: 'text-blue-600',
    },
    {
      planName: 'Niva Bupa ReAssure 2.0',
      insurer: 'Niva Bupa',
      planType: 'Individual',
      sumInsured: 750000,
      coveragePercent: isNetwork ? (isPreExisting ? 60 : 88) : 50,
      claimApprovalRate: 89,
      networkHospital: isNetwork,
      notes: ['Lock the Clock benefit – premium stays same', 'Direct claim settlement'],
      color: 'from-violet-50 to-purple-50',
      accentColor: 'text-violet-600',
    },
    {
      planName: 'Care Supreme',
      insurer: 'Care Health',
      planType: 'Individual',
      sumInsured: 600000,
      coveragePercent: isNetwork ? (isPreExisting ? 68 : 87) : 58,
      claimApprovalRate: 88,
      networkHospital: isNetwork,
      notes: ['Annual health check-up included', 'Unlimited restoration of sum insured'],
      color: 'from-emerald-50 to-green-50',
      accentColor: 'text-emerald-600',
    },
  ];

  return plans.map((plan) => {
    const rawCovered = cost * (plan.coveragePercent / 100);
    const cappedCovered = Math.min(rawCovered, plan.sumInsured);
    const deductible = cost > 50000 ? Math.min(cost * 0.05, 5000) : 0;
    const copayRate = !isNetwork ? 0.2 : isPreExisting ? 0.1 : 0;
    const copay = cappedCovered * copayRate;
    const outOfPocket = cost - cappedCovered + deductible + copay;

    return {
      ...plan,
      coveredAmount: Math.round(cappedCovered),
      deductible: Math.round(deductible),
      copay: Math.round(copay),
      outOfPocket: Math.max(0, Math.round(outOfPocket)),
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function pct(n: number) {
  return n + '%';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  value,
  sub,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
}) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function PlanCard({ plan, rank }: { plan: PlanResult; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const isBest = rank === 0;

  return (
    <div
      className={`card overflow-hidden transition-all duration-200 ${isBest ? 'ring-2 ring-primary/40' : ''}`}
    >
      {isBest && (
        <div className="bg-primary px-4 py-1.5 flex items-center gap-2">
          <CheckCircle2 size={13} className="text-primary-foreground" />
          <span className="text-xs font-bold text-primary-foreground tracking-wide">BEST COVERAGE</span>
        </div>
      )}

      <div className={`bg-gradient-to-r ${plan.color} px-5 py-4`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className={`font-bold text-base ${plan.accentColor}`}>{plan.planName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {plan.insurer} · {plan.planType} · SI {fmt(plan.sumInsured)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`badge ${plan.networkHospital ? 'bg-positive/15 text-positive' : 'bg-warning/15 text-warning'}`}
            >
              {plan.networkHospital ? 'Cashless' : 'Reimbursement'}
            </span>
            <span className="badge bg-card text-muted-foreground border border-border">
              {plan.claimApprovalRate}% approval
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 rounded-xl bg-positive/8 border border-positive/15">
            <p className="text-xs text-muted-foreground mb-1">Coverage</p>
            <p className="text-lg font-bold text-positive tabular-nums">{pct(plan.coveragePercent)}</p>
            <p className="text-xs text-positive/80 font-medium">{fmt(plan.coveredAmount)}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-warning/8 border border-warning/15">
            <p className="text-xs text-muted-foreground mb-1">Deductible</p>
            <p className="text-lg font-bold text-warning tabular-nums">{fmt(plan.deductible)}</p>
            <p className="text-xs text-warning/80 font-medium">one-time</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-info/8 border border-info/15">
            <p className="text-xs text-muted-foreground mb-1">Co-pay</p>
            <p className="text-lg font-bold text-info tabular-nums">{fmt(plan.copay)}</p>
            <p className="text-xs text-info/80 font-medium">your share</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-negative/8 border border-negative/15">
            <p className="text-xs text-muted-foreground mb-1">Out-of-Pocket</p>
            <p className="text-lg font-bold text-negative tabular-nums">{fmt(plan.outOfPocket)}</p>
            <p className="text-xs text-negative/80 font-medium">total est.</p>
          </div>
        </div>

        {/* Coverage bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Coverage breakdown</span>
            <span>{fmt(plan.coveredAmount)} covered of {fmt(plan.coveredAmount + plan.outOfPocket)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-700"
              style={{ width: `${plan.coveragePercent}%` }}
            />
          </div>
        </div>

        {/* Notes toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info size={12} />
          Plan notes & conditions
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {expanded && (
          <ul className="mt-2.5 space-y-1.5 fade-in">
            {plan.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoverageCalculatorContent() {
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [form, setForm] = useState<TreatmentInput>(defaultInput);
  const [results, setResults] = useState<PlanResult[] | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFormChange = useCallback(
    (field: keyof TreatmentInput, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setResults(null);
    },
    []
  );

  const handleCalculate = useCallback(async () => {
    if (!form.treatmentType || !form.estimatedCost) return;
    setCalculating(true);
    setResults(null);
    await new Promise((r) => setTimeout(r, 1200));
    const res = calculateCoverage(form);
    res.sort((a, b) => a.outOfPocket - b.outOfPocket);
    setResults(res);
    setCalculating(false);
  }, [form]);

  const handleReset = useCallback(() => {
    setForm(defaultInput);
    setResults(null);
    setUploadedFile(null);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    processFile(file);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, []);

  const processFile = (file: File) => {
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    setUploadedFile({ name: file.name, size: sizeStr, status: 'uploading' });
    setTimeout(() => {
      setUploadedFile((prev) => prev ? { ...prev, status: 'parsed' } : null);
      // Pre-fill form with mock extracted data
      setForm({
        treatmentType: 'Cardiac Surgery',
        hospitalType: 'network_tier1',
        estimatedCost: '320000',
        diagnosisCode: 'I25.10',
        roomType: 'private',
        durationDays: '7',
        preExisting: true,
        emergencyAdmission: false,
      });
      setResults(null);
    }, 1800);
  };

  const isFormValid = form.treatmentType && form.estimatedCost && parseFloat(form.estimatedCost.replace(/,/g, '')) > 0;

  const bestPlan = results?.[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Calculator size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Coverage Calculator</h1>
              <p className="text-xs text-muted-foreground">Estimate deductibles, copay & out-of-pocket costs by plan</p>
            </div>
          </div>
          {results && (
            <button onClick={handleReset} className="btn-ghost text-xs gap-1.5">
              <RefreshCw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Input mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
          {(['manual', 'upload'] as InputMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                inputMode === mode
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'manual' ? <Stethoscope size={14} /> : <Upload size={14} />}
              {mode === 'manual' ? 'Enter Treatment Details' : 'Upload Extracted Data'}
            </button>
          ))}
        </div>

        {/* Upload panel */}
        {inputMode === 'upload' && (
          <div className="card p-5 fade-in">
            <p className="text-sm font-semibold text-foreground mb-1">Upload a processed medical document</p>
            <p className="text-xs text-muted-foreground mb-4">
              Upload a bill, discharge summary, or lab report — we'll extract treatment details automatically.
            </p>

            {!uploadedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-150 ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CloudUpload size={22} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Drop file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 20 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted/40">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{uploadedFile.size}</p>
                </div>
                {uploadedFile.status === 'uploading' && (
                  <div className="flex items-center gap-1.5 text-xs text-info">
                    <Loader2 size={13} className="animate-spin" /> Parsing…
                  </div>
                )}
                {uploadedFile.status === 'parsed' && (
                  <div className="flex items-center gap-1.5 text-xs text-positive">
                    <CheckCircle2 size={13} /> Fields extracted
                  </div>
                )}
                {uploadedFile.status === 'error' && (
                  <div className="flex items-center gap-1.5 text-xs text-negative">
                    <AlertCircle size={13} /> Parse failed
                  </div>
                )}
                <button
                  onClick={() => { setUploadedFile(null); setForm(defaultInput); setResults(null); }}
                  className="btn-ghost p-1.5 rounded-lg"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {uploadedFile?.status === 'parsed' && (
              <p className="text-xs text-positive mt-3 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                Treatment details pre-filled below. Review and adjust before calculating.
              </p>
            )}
          </div>
        )}

        {/* Treatment input form */}
        <div className="card p-5 fade-in">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Stethoscope size={15} className="text-primary" />
            Treatment Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Treatment type */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Treatment / Procedure <span className="text-negative">*</span>
              </label>
              <select
                value={form.treatmentType}
                onChange={(e) => handleFormChange('treatmentType', e.target.value)}
                className="input-field"
              >
                <option value="">Select treatment type…</option>
                {treatmentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Estimated cost */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Estimated Total Cost (₹) <span className="text-negative">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 250000"
                  value={form.estimatedCost}
                  onChange={(e) => handleFormChange('estimatedCost', e.target.value)}
                  className="input-field pl-7"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Hospitalisation Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={form.durationDays}
                onChange={(e) => handleFormChange('durationDays', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Hospital type */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Hospital Network Type</label>
              <select
                value={form.hospitalType}
                onChange={(e) => handleFormChange('hospitalType', e.target.value)}
                className="input-field"
              >
                {hospitalTypes.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>

            {/* Room type */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Room Type</label>
              <select
                value={form.roomType}
                onChange={(e) => handleFormChange('roomType', e.target.value)}
                className="input-field"
              >
                {roomTypes.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Diagnosis code */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                ICD-10 Diagnosis Code <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. I25.10"
                value={form.diagnosisCode}
                onChange={(e) => handleFormChange('diagnosisCode', e.target.value)}
                className="input-field"
              />
            </div>

            {/* Checkboxes */}
            <div className="sm:col-span-2 flex flex-wrap gap-5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.preExisting}
                  onChange={(e) => handleFormChange('preExisting', e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  Pre-existing condition
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.emergencyAdmission}
                  onChange={(e) => handleFormChange('emergencyAdmission', e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  Emergency admission
                </span>
              </label>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleCalculate}
              disabled={!isFormValid || calculating}
              className="btn-primary gap-2"
            >
              {calculating ? (
                <><Loader2 size={15} className="animate-spin" /> Calculating…</>
              ) : (
                <><Calculator size={15} /> Calculate Coverage</>
              )}
            </button>
            {!isFormValid && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle size={12} /> Fill treatment type and estimated cost to continue
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-5 fade-in">
            {/* Summary cards */}
            {bestPlan && (
              <div>
                <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingDown size={15} className="text-primary" />
                  Best-case estimate — {bestPlan.planName}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryCard
                    icon={<ShieldCheck size={18} className="text-positive" />}
                    label="Covered Amount"
                    value={fmt(bestPlan.coveredAmount)}
                    sub={`${bestPlan.coveragePercent}% of total`}
                    colorClass="bg-positive/10"
                  />
                  <SummaryCard
                    icon={<Receipt size={18} className="text-warning" />}
                    label="Deductible"
                    value={fmt(bestPlan.deductible)}
                    sub="one-time charge"
                    colorClass="bg-warning/10"
                  />
                  <SummaryCard
                    icon={<Wallet size={18} className="text-info" />}
                    label="Co-pay"
                    value={fmt(bestPlan.copay)}
                    sub="your share"
                    colorClass="bg-info/10"
                  />
                  <SummaryCard
                    icon={<TrendingDown size={18} className="text-negative" />}
                    label="Out-of-Pocket"
                    value={fmt(bestPlan.outOfPocket)}
                    sub="total estimated"
                    colorClass="bg-negative/10"
                  />
                </div>
              </div>
            )}

            {/* Plan cards */}
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary" />
                Coverage breakdown by insurance plan
                <span className="badge bg-muted text-muted-foreground ml-1">{results.length} plans</span>
              </h2>
              <div className="space-y-4">
                {results.map((plan, i) => (
                  <PlanCard key={plan.planName} plan={plan} rank={i} />
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-muted/60 border border-border">
              <Info size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                These estimates are indicative and based on standard plan terms. Actual coverage depends on your specific policy, sub-limits, waiting periods, and insurer approval. Consult your insurer or a certified advisor before making financial decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
