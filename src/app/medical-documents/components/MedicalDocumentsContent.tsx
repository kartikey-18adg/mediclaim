'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, FlaskConical, Receipt, ClipboardList, Pill, X, CheckCircle2, Clock, AlertCircle, Eye, Download, Trash2, CloudUpload, Search, ChevronDown, RefreshCw, FileImage, FileScan, Loader2, ZoomIn,  } from 'lucide-react';

type DocCategory = 'all' | 'lab_report' | 'prescription' | 'bill' | 'discharge_summary';
type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface ExtractedField {
  label: string;
  value: string;
}

interface MedicalDocument {
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

const categoryConfig: Record<Exclude<DocCategory, 'all'>, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  lab_report: {
    label: 'Lab Report',
    icon: <FlaskConical size={14} />,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  prescription: {
    label: 'Prescription',
    icon: <Pill size={14} />,
    color: 'text-positive',
    bg: 'bg-positive/10',
  },
  bill: {
    label: 'Medical Bill',
    icon: <Receipt size={14} />,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  discharge_summary: {
    label: 'Discharge Summary',
    icon: <ClipboardList size={14} />,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
};

const statusConfig: Record<ProcessingStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  queued: {
    label: 'Queued',
    icon: <Clock size={12} />,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  processing: {
    label: 'Processing',
    icon: <Loader2 size={12} className="animate-spin" />,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  completed: {
    label: 'Extracted',
    icon: <CheckCircle2 size={12} />,
    color: 'text-positive',
    bg: 'bg-positive/10',
  },
  failed: {
    label: 'Failed',
    icon: <AlertCircle size={12} />,
    color: 'text-negative',
    bg: 'bg-negative/10',
  },
};

const mockDocuments: MedicalDocument[] = [
  {
    id: 'doc-001',
    name: 'CBC_BloodTest_July2025.pdf',
    category: 'lab_report',
    size: '1.2 MB',
    uploadedAt: '2025-07-18T09:30:00',
    status: 'completed',
    progress: 100,
    fileType: 'pdf',
    patientName: 'Arjun Mehta',
    docDate: '18 Jul 2025',
    extractedFields: [
      { label: 'Test Name', value: 'Complete Blood Count (CBC)' },
      { label: 'Haemoglobin', value: '13.8 g/dL (Normal)' },
      { label: 'WBC Count', value: '7,200 /µL (Normal)' },
      { label: 'Platelet Count', value: '2.1 Lakh /µL (Normal)' },
      { label: 'Lab Name', value: 'SRL Diagnostics, Mumbai' },
      { label: 'Referred By', value: 'Dr. Priya Sharma' },
    ],
  },
  {
    id: 'doc-002',
    name: 'Apollo_Discharge_Summary.pdf',
    category: 'discharge_summary',
    size: '3.4 MB',
    uploadedAt: '2025-07-10T14:15:00',
    status: 'completed',
    progress: 100,
    fileType: 'pdf',
    patientName: 'Arjun Mehta',
    docDate: '10 Jul 2025',
    extractedFields: [
      { label: 'Hospital', value: 'Apollo Hospitals, Mumbai' },
      { label: 'Admission Date', value: '05 Jul 2025' },
      { label: 'Discharge Date', value: '10 Jul 2025' },
      { label: 'Diagnosis', value: 'Acute Appendicitis' },
      { label: 'Procedure', value: 'Laparoscopic Appendectomy' },
      { label: 'Attending Surgeon', value: 'Dr. Rajesh Nair' },
    ],
  },
  {
    id: 'doc-003',
    name: 'Hospital_Bill_Apollo_July.pdf',
    category: 'bill',
    size: '0.8 MB',
    uploadedAt: '2025-07-10T16:00:00',
    status: 'completed',
    progress: 100,
    fileType: 'pdf',
    patientName: 'Arjun Mehta',
    docDate: '10 Jul 2025',
    extractedFields: [
      { label: 'Hospital', value: 'Apollo Hospitals, Mumbai' },
      { label: 'Bill No.', value: 'APL-2025-07-8821' },
      { label: 'Total Amount', value: '₹58,400' },
      { label: 'Insurance Covered', value: '₹52,560 (90%)' },
      { label: 'Patient Payable', value: '₹5,840' },
      { label: 'GST', value: '₹1,050' },
    ],
  },
  {
    id: 'doc-004',
    name: 'Prescription_PostOp_Nair.jpg',
    category: 'prescription',
    size: '0.5 MB',
    uploadedAt: '2025-07-11T10:00:00',
    status: 'processing',
    progress: 62,
    fileType: 'image',
    patientName: 'Arjun Mehta',
    docDate: '11 Jul 2025',
  },
  {
    id: 'doc-005',
    name: 'Lipid_Panel_June2025.pdf',
    category: 'lab_report',
    size: '0.9 MB',
    uploadedAt: '2025-06-22T08:45:00',
    status: 'completed',
    progress: 100,
    fileType: 'pdf',
    patientName: 'Arjun Mehta',
    docDate: '22 Jun 2025',
    extractedFields: [
      { label: 'Test Name', value: 'Lipid Profile Panel' },
      { label: 'Total Cholesterol', value: '198 mg/dL (Normal)' },
      { label: 'LDL', value: '122 mg/dL (Borderline)' },
      { label: 'HDL', value: '48 mg/dL (Normal)' },
      { label: 'Triglycerides', value: '142 mg/dL (Normal)' },
      { label: 'Lab Name', value: 'Metropolis Healthcare, Pune' },
    ],
  },
  {
    id: 'doc-006',
    name: 'Scan_Report_Abdomen.pdf',
    category: 'lab_report',
    size: '4.1 MB',
    uploadedAt: '2025-07-04T11:30:00',
    status: 'failed',
    progress: 0,
    fileType: 'pdf',
    patientName: 'Arjun Mehta',
    docDate: '04 Jul 2025',
    errorMessage: 'File is password-protected. Please upload an unlocked version.',
  },
];

const categoryFilters: { value: DocCategory; label: string }[] = [
  { value: 'all', label: 'All Documents' },
  { value: 'lab_report', label: 'Lab Reports' },
  { value: 'prescription', label: 'Prescriptions' },
  { value: 'bill', label: 'Bills' },
  { value: 'discharge_summary', label: 'Discharge Summaries' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function MedicalDocumentsContent() {
  const [documents, setDocuments] = useState<MedicalDocument[]>(mockDocuments);
  const [activeCategory, setActiveCategory] = useState<DocCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [uploadCategory, setUploadCategory] = useState<Exclude<DocCategory, 'all'>>('lab_report');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = documents.filter((doc) => {
    const matchCat = activeCategory === 'all' || doc.category === activeCategory;
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: documents.length,
    completed: documents.filter((d) => d.status === 'completed').length,
    processing: documents.filter((d) => d.status === 'processing' || d.status === 'queued').length,
    failed: documents.filter((d) => d.status === 'failed').length,
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const simulateUpload = (file: File) => {
    const newDoc: MedicalDocument = {
      id: `doc-new-${Date.now()}`,
      name: file.name,
      category: uploadCategory,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      status: 'queued',
      progress: 0,
      fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
      patientName: 'Arjun Mehta',
      docDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === newDoc.id ? { ...d, status: 'processing', progress: 30 } : d))
      );
    }, 800);
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === newDoc.id ? { ...d, progress: 65 } : d))
      );
    }, 2000);
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === newDoc.id
            ? {
                ...d,
                status: 'completed',
                progress: 100,
                extractedFields: [
                  { label: 'Document Type', value: categoryConfig[uploadCategory].label },
                  { label: 'File Name', value: file.name },
                  { label: 'Processed On', value: new Date().toLocaleDateString('en-IN') },
                  { label: 'Status', value: 'Successfully extracted' },
                ],
              }
            : d
        )
      );
    }, 3500);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(simulateUpload);
    },
    [uploadCategory]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(simulateUpload);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const handleRetry = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'queued', progress: 0, errorMessage: undefined } : d
      )
    );
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'processing', progress: 45 } : d))
      );
    }, 600);
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status: 'completed',
                progress: 100,
                extractedFields: [
                  { label: 'Document Type', value: 'Lab Report' },
                  { label: 'Status', value: 'Successfully extracted on retry' },
                ],
              }
            : d
        )
      );
    }, 2800);
  };

  return (
    <div className="flex h-full">
      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Medical Documents</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload and manage your health records — AI extracts structured data automatically
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary flex-shrink-0"
            >
              <Upload size={15} />
              Upload Document
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-foreground' },
              { label: 'Extracted', value: stats.completed, color: 'text-positive' },
              { label: 'Processing', value: stats.processing, color: 'text-info' },
              { label: 'Failed', value: stats.failed, color: 'text-negative' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-border ml-1.5">·</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-muted/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/15' : 'bg-muted'}`}>
                <CloudUpload size={26} className={isDragging ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {isDragging ? 'Drop files to upload' : 'Drag & drop files here'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, JPG, PNG · Lab reports, prescriptions, bills, discharge summaries
                </p>
              </div>
              {/* Category selector inside drop zone */}
              <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-muted-foreground">Upload as:</span>
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <span className={categoryConfig[uploadCategory].color}>
                      {categoryConfig[uploadCategory].icon}
                    </span>
                    {categoryConfig[uploadCategory].label}
                    <ChevronDown size={12} />
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                      {(Object.keys(categoryConfig) as Exclude<DocCategory, 'all'>[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setUploadCategory(cat); setShowCategoryDropdown(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-muted transition-colors ${uploadCategory === cat ? 'text-primary' : 'text-foreground'}`}
                        >
                          <span className={categoryConfig[cat].color}>{categoryConfig[cat].icon}</span>
                          {categoryConfig[cat].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {categoryFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveCategory(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeCategory === f.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document List */}
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <FileScan size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or upload a new document</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((doc) => {
                const cat = categoryConfig[doc.category as Exclude<DocCategory, 'all'>];
                const st = statusConfig[doc.status];
                const isSelected = selectedDoc?.id === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(isSelected ? null : doc)}
                    className={`card p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary/40 shadow-md' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* File icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                        {doc.fileType === 'image' ? (
                          <FileImage size={18} className={cat.color} />
                        ) : (
                          <FileText size={18} className={cat.color} />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate max-w-[260px]">{doc.name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cat.bg} ${cat.color}`}>
                            {cat.icon}
                            {cat.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                          <span className="text-border">·</span>
                          <span className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)} at {formatTime(doc.uploadedAt)}</span>
                          {doc.docDate && (
                            <>
                              <span className="text-border">·</span>
                              <span className="text-xs text-muted-foreground">Doc date: {doc.docDate}</span>
                            </>
                          )}
                        </div>
                        {/* Progress bar for processing */}
                        {doc.status === 'processing' && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-info font-medium">Extracting data…</span>
                              <span className="text-xs text-muted-foreground tabular-nums">{doc.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-info rounded-full transition-all duration-500"
                                style={{ width: `${doc.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {doc.status === 'failed' && doc.errorMessage && (
                          <p className="text-xs text-negative mt-1.5 flex items-center gap-1">
                            <AlertCircle size={11} /> {doc.errorMessage}
                          </p>
                        )}
                      </div>

                      {/* Status badge + actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}>
                          {st.icon}
                          {st.label}
                        </span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {doc.status === 'completed' && (
                            <button
                              onClick={() => setSelectedDoc(isSelected ? null : doc)}
                              className="btn-ghost p-1.5 rounded-lg"
                              title="Preview extracted data"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {doc.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(doc.id)}
                              className="btn-ghost p-1.5 rounded-lg text-info hover:text-info"
                              title="Retry processing"
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="btn-ghost p-1.5 rounded-lg text-muted-foreground hover:text-negative hover:bg-negative/10"
                            title="Delete document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDoc && (
        <div className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto scrollbar-thin fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
            <div>
              <p className="text-sm font-bold text-foreground">Extracted Data</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">{selectedDoc.name}</p>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="btn-ghost p-1.5 rounded-lg"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Category + Status */}
            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const cat = categoryConfig[selectedDoc.category as Exclude<DocCategory, 'all'>];
                const st = statusConfig[selectedDoc.status];
                return (
                  <>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.color}`}>
                      {cat.icon} {cat.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}>
                      {st.icon} {st.label}
                    </span>
                  </>
                );
              })()}
            </div>

            {/* File preview placeholder */}
            <div className="rounded-xl bg-muted border border-border h-36 flex flex-col items-center justify-center gap-2">
              {selectedDoc.fileType === 'image' ? (
                <FileImage size={28} className="text-muted-foreground" />
              ) : (
                <FileText size={28} className="text-muted-foreground" />
              )}
              <p className="text-xs text-muted-foreground">
                {selectedDoc.fileType === 'pdf' ? 'PDF Document' : 'Image File'}
              </p>
              <button className="btn-ghost text-xs py-1 px-2.5 rounded-lg gap-1">
                <ZoomIn size={12} /> Preview File
              </button>
            </div>

            {/* Extracted Fields */}
            {selectedDoc.extractedFields && selectedDoc.extractedFields.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  AI-Extracted Fields
                </p>
                <div className="space-y-2.5">
                  {selectedDoc.extractedFields.map((field, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">{field.label}</span>
                      <span className="text-sm font-semibold text-foreground">{field.value}</span>
                      {i < selectedDoc.extractedFields!.length - 1 && (
                        <div className="border-b border-border mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedDoc.status === 'processing' ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 size={24} className="text-info animate-spin" />
                <p className="text-sm text-muted-foreground text-center">
                  AI is extracting structured data from your document…
                </p>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-info rounded-full transition-all duration-500"
                    style={{ width: `${selectedDoc.progress}%` }}
                  />
                </div>
              </div>
            ) : selectedDoc.status === 'failed' ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <AlertCircle size={24} className="text-negative" />
                <p className="text-sm text-negative font-medium text-center">Extraction Failed</p>
                {selectedDoc.errorMessage && (
                  <p className="text-xs text-muted-foreground text-center">{selectedDoc.errorMessage}</p>
                )}
                <button
                  onClick={() => handleRetry(selectedDoc.id)}
                  className="btn-secondary text-xs gap-1.5"
                >
                  <RefreshCw size={12} /> Retry Extraction
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <Clock size={24} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">Queued for processing</p>
              </div>
            )}

            {/* Actions */}
            {selectedDoc.status === 'completed' && (
              <div className="flex gap-2 pt-2">
                <button className="btn-primary flex-1 text-xs py-2">
                  <Download size={13} /> Download
                </button>
                <button className="btn-secondary flex-1 text-xs py-2">
                  Use for Claim
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
