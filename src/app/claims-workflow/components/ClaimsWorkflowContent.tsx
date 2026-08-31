'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileText, ShieldCheck, Calculator, Send, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Info, Loader2, Edit3, Check, X, ClipboardList, Receipt, FlaskConical, Pill, Building2, User, Stethoscope, BadgeCheck, TrendingDown, Wallet, Download, Eye, Star, ChevronDown, ChevronUp, Sparkles,  } from 'lucide-react';

import {
  fetchClaimExtractedFields,
  fetchClaimSourceDocuments,
  fetchInsurancePlans,
  type ClaimExtractedField as ExtractedField,
  type ClaimSourceDocument as SourceDocument,
  type InsurancePlan,
} from '@/lib/api';
import { useSupabaseQuery } from '@/lib/use-supabase-query';
import { ErrorState, LoadingState } from '@/components/DataStates';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

const docTypeConfig = {
  discharge_summary: { icon: <ClipboardList size={13} />, color: 'text-accent', bg: 'bg-accent/10', label: 'Discharge Summary' },
  bill: { icon: <Receipt size={13} />, color: 'text-warning', bg: 'bg-warning/10', label: 'Medical Bill' },
  lab_report: { icon: <FlaskConical size={13} />, color: 'text-info', bg: 'bg-info/10', label: 'Lab Report' },
  prescription: { icon: <Pill size={13} />, color: 'text-positive', bg: 'bg-positive/10', label: 'Prescription' },
};

const categoryConfig = {
  patient: { label: 'Patient Details', icon: <User size={14} /> },
  hospital: { label: 'Hospital Details', icon: <Building2 size={14} /> },
  treatment: { label: 'Treatment Details', icon: <Stethoscope size={14} /> },
  financial: { label: 'Financial Breakdown', icon: <Receipt size={14} /> },
};

const steps = [
  { id: 1, label: 'Review AI Data', icon: <Sparkles size={15} /> },
  { id: 2, label: 'Select Plan', icon: <ShieldCheck size={15} /> },
  { id: 3, label: 'Confirm Coverage', icon: <Calculator size={15} /> },
  { id: 4, label: 'Submit Claim', icon: <Send size={15} /> },
];

// ─── Step 1: AI Data Review ───────────────────────────────────────────────────

function StepReviewData({
  fields,
  sourceDocuments,
  onFieldChange,
}: {
  fields: ExtractedField[];
  sourceDocuments: SourceDocument[];
  onFieldChange: (key: string, value: string) => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['patient', 'hospital', 'treatment', 'financial'])
  );

  const grouped = (['patient', 'hospital', 'treatment', 'financial'] as const).map((cat) => ({
    cat,
    fields: fields.filter((f) => f.category === cat),
  }));

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const startEdit = (field: ExtractedField) => {
    setEditingKey(field.key);
    setEditValue(field.value);
  };

  const saveEdit = (key: string) => {
    onFieldChange(key, editValue);
    setEditingKey(null);
  };

  const cancelEdit = () => setEditingKey(null);

  return (
    <div className="space-y-5">
      {/* Source documents */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">AI-Extracted from Documents</p>
          <span className="ml-auto badge bg-positive/10 text-positive text-xs">
            {sourceDocuments.length} sources
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sourceDocuments.map((doc) => {
            const cfg = docTypeConfig[doc.type];
            return (
              <div key={doc.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border">
                <span className={`${cfg.color}`}>{cfg.icon}</span>
                <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{doc.name}</span>
                <span className="text-xs text-positive font-semibold">{doc.confidence}%</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1.5">
          <Info size={11} />
          Review and correct any fields before proceeding. Editable fields are marked with a pencil icon.
        </p>
      </div>

      {/* Grouped fields */}
      {grouped.map(({ cat, fields: catFields }) => {
        const cfg = categoryConfig[cat];
        const isExpanded = expandedCategories.has(cat);
        return (
          <div key={cat} className="card overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center gap-2.5 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <span className="text-muted-foreground">{cfg.icon}</span>
              <span className="text-sm font-semibold text-foreground">{cfg.label}</span>
              <span className="ml-auto text-muted-foreground">
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            {isExpanded && (
              <div className="divide-y divide-border">
                {catFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-3 px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">{field.label}</p>
                      {editingKey === field.key ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 text-sm font-medium text-foreground bg-muted border border-primary/40 rounded-lg px-2.5 py-1 outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <button
                            onClick={() => saveEdit(field.key)}
                            className="p-1.5 rounded-lg bg-positive/10 text-positive hover:bg-positive/20 transition-colors"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-border transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">{field.value}</p>
                      )}
                    </div>
                    {field.editable && editingKey !== field.key && (
                      <button
                        onClick={() => startEdit(field)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Edit field"
                      >
                        <Edit3 size={13} />
                      </button>
                    )}
                    {!field.editable && (
                      <span className="text-xs text-muted-foreground/60 flex-shrink-0">auto</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 2: Plan Selection ───────────────────────────────────────────────────

function StepSelectPlan({
  plans,
  selectedPlanId,
  onSelect,
}: {
  plans: InsurancePlan[];
  selectedPlanId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="card p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <ShieldCheck size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Select Your Insurance Plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose the plan you want to file this claim under. Coverage estimates are pre-calculated based on your extracted treatment data.
            </p>
          </div>
        </div>
      </div>

      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        return (
          <button
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            className={`w-full text-left card overflow-hidden transition-all duration-200 ${
              isSelected ? `ring-2 ${plan.ringColor} shadow-elevated` : 'hover:shadow-card'
            }`}
          >
            {plan.isBest && (
              <div className="bg-primary px-4 py-1.5 flex items-center gap-2">
                <Star size={12} className="text-primary-foreground fill-primary-foreground" />
                <span className="text-xs font-bold text-primary-foreground tracking-wide">RECOMMENDED — LOWEST OUT-OF-POCKET</span>
              </div>
            )}

            <div className={`bg-gradient-to-r ${plan.color} px-5 py-4`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className={`font-bold text-base ${plan.accentColor}`}>{plan.planName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.insurer}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">Policy: {plan.policyNumber}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-primary bg-primary' : 'border-border bg-card'
                  }`}>
                    {isSelected && <Check size={11} className="text-primary-foreground" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${plan.networkHospital ? 'bg-positive/15 text-positive' : 'bg-warning/15 text-warning'}`}>
                      {plan.networkHospital ? 'Cashless' : 'Reimbursement'}
                    </span>
                    <span className="badge bg-card text-muted-foreground border border-border">
                      {plan.claimApprovalRate}% approval
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div className="text-center p-3 rounded-xl bg-positive/8 border border-positive/15">
                  <p className="text-xs text-muted-foreground mb-1">Coverage</p>
                  <p className="text-base font-bold text-positive tabular-nums">{plan.coveragePercent}%</p>
                  <p className="text-xs text-positive/80 font-medium">{fmt(plan.coveredAmount)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-warning/8 border border-warning/15">
                  <p className="text-xs text-muted-foreground mb-1">Deductible</p>
                  <p className="text-base font-bold text-warning tabular-nums">{fmt(plan.deductible)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-info/8 border border-info/15">
                  <p className="text-xs text-muted-foreground mb-1">Co-pay</p>
                  <p className="text-base font-bold text-info tabular-nums">{fmt(plan.copay)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-negative/8 border border-negative/15">
                  <p className="text-xs text-muted-foreground mb-1">Out-of-Pocket</p>
                  <p className="text-base font-bold text-negative tabular-nums">{fmt(plan.outOfPocket)}</p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-700"
                  style={{ width: `${plan.coveragePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Insurer pays {fmt(plan.coveredAmount)}</span>
                <span>You pay {fmt(plan.outOfPocket)}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 3: Coverage Confirmation ───────────────────────────────────────────

function StepConfirmCoverage({ plan, fields }: { plan: InsurancePlan; fields: ExtractedField[] }) {
  const totalBillField = fields.find((f) => f.key === 'total_bill');
  const totalBill = 58400;

  const lineItems = [
    { label: 'Surgery Charges', amount: 32000, covered: Math.round(32000 * (plan.coveragePercent / 100)) },
    { label: 'Room & Nursing (5 nights)', amount: 12500, covered: Math.round(12500 * (plan.coveragePercent / 100)) },
    { label: 'Medicine & Consumables', amount: 8900, covered: Math.round(8900 * (plan.coveragePercent / 100)) },
    { label: 'Diagnostic Charges', amount: 5000, covered: Math.round(5000 * (plan.coveragePercent / 100)) },
  ];

  return (
    <div className="space-y-5">
      {/* Selected plan summary */}
      <div className={`card p-4 bg-gradient-to-r ${plan.color} border-0`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className={plan.accentColor} />
          </div>
          <div>
            <p className={`font-bold text-sm ${plan.accentColor}`}>{plan.planName}</p>
            <p className="text-xs text-muted-foreground">{plan.insurer} · Policy {plan.policyNumber}</p>
          </div>
          <BadgeCheck size={18} className="ml-auto text-positive" />
        </div>
      </div>

      {/* Coverage breakdown table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Calculator size={14} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Coverage Breakdown</p>
        </div>
        <div className="divide-y divide-border">
          {lineItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium">{item.label}</p>
              </div>
              <div className="text-right flex-shrink-0 w-28">
                <p className="text-xs text-muted-foreground">Billed</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">{fmt(item.amount)}</p>
              </div>
              <div className="text-right flex-shrink-0 w-28">
                <p className="text-xs text-positive">Covered</p>
                <p className="text-sm font-bold text-positive tabular-nums">{fmt(item.covered)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Total Billed</p>
            <p className="text-sm font-bold text-foreground tabular-nums">{fmt(totalBill)}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <div className="w-9 h-9 rounded-xl bg-positive/10 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck size={16} className="text-positive" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Insurance Covers</p>
          <p className="text-lg font-bold text-positive tabular-nums">{fmt(plan.coveredAmount)}</p>
          <p className="text-xs text-positive/80">{plan.coveragePercent}% of bill</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
            <TrendingDown size={16} className="text-warning" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Deductible</p>
          <p className="text-lg font-bold text-warning tabular-nums">{fmt(plan.deductible)}</p>
          <p className="text-xs text-muted-foreground">one-time</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center mx-auto mb-2">
            <Wallet size={16} className="text-info" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">Co-pay</p>
          <p className="text-lg font-bold text-info tabular-nums">{fmt(plan.copay)}</p>
          <p className="text-xs text-muted-foreground">your share</p>
        </div>
        <div className="card p-4 text-center ring-2 ring-negative/20">
          <div className="w-9 h-9 rounded-xl bg-negative/10 flex items-center justify-center mx-auto mb-2">
            <Receipt size={16} className="text-negative" />
          </div>
          <p className="text-xs text-muted-foreground mb-1">You Pay</p>
          <p className="text-lg font-bold text-negative tabular-nums">{fmt(plan.outOfPocket)}</p>
          <p className="text-xs text-muted-foreground">out-of-pocket</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 bg-warning/5 border-warning/20">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={14} className="text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Coverage estimates are based on AI-extracted data and plan terms. Final settlement amounts may vary subject to insurer verification, policy sub-limits, and claim adjudication. Cashless settlement is subject to hospital network approval.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Submit Claim ─────────────────────────────────────────────────────

function StepSubmitClaim({
  plan,
  fields,
  onSubmit,
  submitting,
  submitted,
}: {
  plan: InsurancePlan;
  fields: ExtractedField[];
  onSubmit: () => void;
  submitting: boolean;
  submitted: boolean;
}) {
  const [agreed, setAgreed] = useState(false);

  const claimDocs = [
    { label: 'Structured Claim Form (IRDA Format)', ready: true },
    { label: 'Discharge Summary', ready: true },
    { label: 'Hospital Bill & Receipts', ready: true },
    { label: 'Lab Reports (CBC, Lipid Panel)', ready: true },
    { label: 'Pre-authorisation Letter', ready: true },
    { label: 'KYC Documents (Aadhaar, PAN)', ready: false },
  ];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-positive/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-positive" />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">Claim Submitted Successfully!</p>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your claim has been submitted to {plan.insurer}
          </p>
        </div>
        <div className="card p-4 w-full max-w-sm text-left space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Claim Reference</span>
            <span className="font-bold text-foreground font-mono">CLM-2025-APL-00482</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Submitted To</span>
            <span className="font-semibold text-foreground">{plan.insurer}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Claim Amount</span>
            <span className="font-bold text-positive">{fmt(plan.coveredAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expected TAT</span>
            <span className="font-semibold text-foreground">7–10 working days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="badge bg-info/10 text-info">Under Review</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl">
            <Download size={14} />
            Download Claim Copy
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl">
            <Eye size={14} />
            Track Claim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Claim summary */}
      <div className="card p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Claim Summary</p>
        <div className="space-y-2">
          {[
            { label: 'Patient', value: fields.find((f) => f.key === 'patient_name')?.value ?? '—' },
            { label: 'Hospital', value: fields.find((f) => f.key === 'hospital_name')?.value ?? '—' },
            { label: 'Diagnosis', value: fields.find((f) => f.key === 'diagnosis')?.value ?? '—' },
            { label: 'Procedure', value: fields.find((f) => f.key === 'procedure')?.value ?? '—' },
            { label: 'Insurance Plan', value: plan.planName },
            { label: 'Claim Amount', value: fmt(plan.coveredAmount) },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">{row.label}</span>
              <span className="text-xs font-semibold text-foreground flex-1">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document checklist */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <ClipboardList size={14} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Document Checklist</p>
        </div>
        <div className="divide-y divide-border">
          {claimDocs.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                doc.ready ? 'bg-positive/10' : 'bg-warning/10'
              }`}>
                {doc.ready
                  ? <CheckCircle2 size={12} className="text-positive" />
                  : <AlertCircle size={12} className="text-warning" />
                }
              </div>
              <p className="text-sm text-foreground flex-1">{doc.label}</p>
              <span className={`text-xs font-medium ${doc.ready ? 'text-positive' : 'text-warning'}`}>
                {doc.ready ? 'Ready' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Declaration */}
      <div className="card p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              agreed ? 'bg-primary border-primary' : 'border-border bg-card'
            }`}
          >
            {agreed && <Check size={11} className="text-primary-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            I hereby declare that the information provided in this claim is true and correct to the best of my knowledge. I authorise {plan.insurer} to verify the details with the treating hospital and process the claim accordingly. I understand that any false information may result in claim rejection.
          </p>
        </label>
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={!agreed || submitting}
        className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
          agreed && !submitting
            ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-elevated'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting Claim...
          </>
        ) : (
          <>
            <Send size={16} />
            Submit Claim to {plan.insurer}
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

async function fetchClaimData() {
  const [sourceDocuments, extractedFields, plans] = await Promise.all([
    fetchClaimSourceDocuments(),
    fetchClaimExtractedFields(),
    fetchInsurancePlans(),
  ]);

  return { sourceDocuments, extractedFields, plans };
}

export default function ClaimsWorkflowContent() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data, loading, error, refetch } = useSupabaseQuery(fetchClaimData);

  const sourceDocuments = data?.sourceDocuments ?? [];
  const insurancePlans = data?.plans ?? [];

  useEffect(() => {
    if (data) setFields(data.extractedFields);
  }, [data]);

  const selectedPlan = insurancePlans.find((p) => p.id === selectedPlanId) ?? null;

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  }, []);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
  };

  const canProceed = () => {
    if (loading || error) return false;
    if (currentStep === 1) return fields.length > 0;
    if (currentStep === 2) return selectedPlanId !== null;
    if (currentStep === 3) return selectedPlan !== null;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Claims Submission Workflow</h1>
              <p className="text-xs text-muted-foreground">Laparoscopic Appendectomy · Apollo Hospitals, Mumbai · Jul 2025</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-positive text-white'
                          : isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : step.icon}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive ? 'text-primary' : isCompleted ? 'text-positive' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-5 rounded-full transition-all duration-500 ${
                        currentStep > step.id ? 'bg-positive' : 'bg-border'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading && <LoadingState label="Loading claim data from Supabase…" rows={5} />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && currentStep === 1 && (
          <StepReviewData
            fields={fields}
            sourceDocuments={sourceDocuments}
            onFieldChange={handleFieldChange}
          />
        )}
        {!loading && !error && currentStep === 2 && (
          <StepSelectPlan
            plans={insurancePlans}
            selectedPlanId={selectedPlanId}
            onSelect={setSelectedPlanId}
          />
        )}
        {!loading && !error && currentStep === 3 && selectedPlan && (
          <StepConfirmCoverage plan={selectedPlan} fields={fields} />
        )}
        {!loading && !error && currentStep === 4 && selectedPlan && (
          <StepSubmitClaim
            plan={selectedPlan}
            fields={fields}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitted={submitted}
          />
        )}

        {/* Navigation */}
        {!submitted && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentStep === 1
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'btn-secondary hover:shadow-card'
              }`}
            >
              <ChevronLeft size={15} />
              Back
            </button>

            <div className="flex items-center gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep === step.id ? 'bg-primary w-5' : currentStep > step.id ? 'bg-positive' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  canProceed()
                    ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-elevated'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {currentStep === 3 ? 'Proceed to Submit' : 'Continue'}
                <ChevronRight size={15} />
              </button>
            ) : (
              <div className="w-24" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
