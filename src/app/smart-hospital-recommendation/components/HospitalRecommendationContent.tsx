'use client';

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, CheckCircle2, Clock, Bed, ShieldCheck, TrendingUp, IndianRupee, ChevronDown, X, ArrowUpDown, Wifi, Building2, AlertCircle, Stethoscope, Phone, ExternalLink, Heart, Filter,  } from 'lucide-react';
import { toast } from 'sonner';
import { fetchHospitals, type Hospital } from '@/lib/api';
import { useSupabaseQuery } from '@/lib/use-supabase-query';
import { ErrorState, LoadingState } from '@/components/DataStates';

type SortOption = 'match' | 'distance' | 'rating' | 'claim-rate' | 'cost';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'match', label: 'Best Match' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'claim-rate', label: 'Claim Acceptance' },
  { value: 'cost', label: 'Lowest Cost' },
];

function AccreditationBadge({ name }: { name: 'NABH' | 'JCI' | 'NABL' }) {
  const colors: Record<string, string> = {
    NABH: 'bg-primary/10 text-primary',
    JCI: 'bg-accent/10 text-accent',
    NABL: 'bg-warning/10 text-warning',
  };
  return (
    <span className={`badge text-xs font-bold ${colors[name]}`}>{name}</span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <Star size={12} className="text-warning fill-warning" />
      <span className="text-xs font-semibold tabular-nums text-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

function BedAvailabilityIndicator({ available, total }: { available: number; total: number }) {
  const pct = (available / total) * 100;
  const color = pct > 15 ? 'text-positive' : pct > 5 ? 'text-warning' : 'text-negative';
  const label = pct > 15 ? 'Available' : pct > 5 ? 'Limited' : 'Critical';
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
      <Bed size={12} />
      {available} beds · {label}
    </span>
  );
}

interface HospitalCardProps {
  hospital: Hospital;
  onBook: (h: Hospital) => void;
  onCompare: (h: Hospital) => void;
  isComparing: boolean;
}

function HospitalCard({ hospital: h, onBook, onCompare, isComparing }: HospitalCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <div className={`card p-5 hover:shadow-elevated transition-all duration-200 fade-in ${
      isComparing ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">{h.name}</h3>
              {h.inNetwork && (
                <span className="badge-positive text-xs">
                  <Wifi size={10} /> In-Network
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="flex-shrink-0" />
              {h.location} · {h.distance} km away
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StarRating rating={h.rating} />
              <span className="text-xs text-muted-foreground tabular-nums">({h.reviewCount.toLocaleString('en-IN')} reviews)</span>
              <span className="badge-muted text-xs">{h.type}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            <TrendingUp size={11} />
            <span className="text-xs font-bold tabular-nums">{h.matchScore}% match</span>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={`btn-ghost p-1.5 rounded-lg ${saved ? 'text-negative' : ''}`}
            aria-label={saved ? 'Remove from saved' : 'Save hospital'}
          >
            <Heart size={14} className={saved ? 'fill-negative' : ''} />
          </button>
        </div>
      </div>

      {/* Accreditations */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {h.accreditations.map((acc) => (
          <AccreditationBadge key={`acc-${h.id}-${acc}`} name={acc} />
        ))}
        {h.emergencyAvailable && (
          <span className="badge bg-negative/10 text-negative text-xs">
            <AlertCircle size={10} /> 24/7 Emergency
          </span>
        )}
      </div>

      {/* Specialties */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-1.5">Specialties</p>
        <div className="flex flex-wrap gap-1.5">
          {h.specialties.slice(0, 4).map((spec) => (
            <span key={`spec-${h.id}-${spec}`} className="badge-muted text-xs">
              <Stethoscope size={9} /> {spec}
            </span>
          ))}
          {h.specialties.length > 4 && (
            <span className="badge-muted text-xs">+{h.specialties.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 bg-muted/40 rounded-xl">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Claim Rate</p>
          <p className={`text-sm font-bold tabular-nums ${
            h.claimAcceptanceRate >= 95 ? 'text-positive' :
            h.claimAcceptanceRate >= 85 ? 'text-warning' : 'text-negative'
          }`}>
            {h.claimAcceptanceRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Est. Cost</p>
          <p className="text-sm font-bold tabular-nums text-foreground">
            ₹{(h.estimatedCostMin / 1000).toFixed(0)}k–{(h.estimatedCostMax / 1000).toFixed(0)}k
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Out-of-Pocket</p>
          <p className="text-sm font-bold tabular-nums text-primary">
            ₹{(h.outOfPocketMin / 1000).toFixed(1)}k–{(h.outOfPocketMax / 1000).toFixed(1)}k
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Wait Time</p>
          <p className="text-sm font-semibold text-foreground flex items-center gap-1">
            <Clock size={11} className="text-muted-foreground" />
            {h.waitTime}
          </p>
        </div>
      </div>

      <BedAvailabilityIndicator available={h.bedsAvailable} total={h.totalBeds} />

      {/* Insurance */}
      <div className="mt-2 mb-4">
        <p className="text-xs text-muted-foreground mb-1">Accepted Insurance</p>
        <div className="flex flex-wrap gap-1.5">
          {h.insurance.slice(0, 3).map((ins) => (
            <span key={`ins-${h.id}-${ins}`} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium">
              {ins}
            </span>
          ))}
          {h.insurance.length > 3 && (
            <span className="text-xs text-muted-foreground">+{h.insurance.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          onClick={() => onBook(h)}
          className="btn-primary flex-1 text-xs py-2"
        >
          <CheckCircle2 size={13} />
          Book Appointment
        </button>
        <button
          onClick={() => onCompare(h)}
          className={`btn-secondary text-xs py-2 px-3 ${isComparing ? 'border-primary text-primary' : ''}`}
        >
          {isComparing ? <X size={13} /> : <ArrowUpDown size={13} />}
          {isComparing ? 'Remove' : 'Compare'}
        </button>
        <a
          href={`tel:${h.phone}`}
          className="btn-ghost p-2 rounded-xl"
          aria-label={`Call ${h.name}`}
          title={`Call ${h.phone}`}
        >
          <Phone size={14} />
        </a>
        <button className="btn-ghost p-2 rounded-xl" title="View full profile">
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}

export default function HospitalRecommendationContent() {
  const [searchQuery, setSearchQuery] = useState('Chest pain and high blood pressure');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string[]>(['Cardiology']);
  const [selectedInsurance, setSelectedInsurance] = useState('Star Health');
  const [distanceRadius, setDistanceRadius] = useState(20);
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [inNetworkOnly, setInNetworkOnly] = useState(false);
  const [nabh, setNabh] = useState(false);
  const [minClaimRate, setMinClaimRate] = useState(0);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data, loading, error, refetch } = useSupabaseQuery(fetchHospitals);
  const hospitals = useMemo(() => data ?? [], [data]);

  const specialtyOptions = useMemo(
    () => Array.from(new Set(hospitals.flatMap((h) => h.specialties))).sort(),
    [hospitals]
  );

  const insuranceOptions = useMemo(
    () => Array.from(new Set(hospitals.flatMap((h) => h.insurance))).sort(),
    [hospitals]
  );

  const filteredHospitals = useMemo(() => {
    let results = hospitals.filter((h) => {
      if (inNetworkOnly && !h.inNetwork) return false;
      if (nabh && !h.accreditations.includes('NABH')) return false;
      if (h.distance > distanceRadius) return false;
      if (h.claimAcceptanceRate < minClaimRate) return false;
      if (selectedSpecialty.length > 0) {
        const hasSpecialty = selectedSpecialty.some((s) => h.specialties.includes(s));
        if (!hasSpecialty) return false;
      }
      if (selectedInsurance && !h.insurance.includes(selectedInsurance)) return false;
      return true;
    });

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'match': return b.matchScore - a.matchScore;
        case 'distance': return a.distance - b.distance;
        case 'rating': return b.rating - a.rating;
        case 'claim-rate': return b.claimAcceptanceRate - a.claimAcceptanceRate;
        case 'cost': return a.estimatedCostMin - b.estimatedCostMin;
        default: return 0;
      }
    });

    return results;
  }, [hospitals, inNetworkOnly, nabh, distanceRadius, minClaimRate, selectedSpecialty, selectedInsurance, sortBy]);

  const handleBook = (h: Hospital) => {
    toast.success(`Appointment request sent to ${h.name}`);
  };

  const handleCompare = (h: Hospital) => {
    setCompareList((prev) => {
      if (prev.includes(h.id)) return prev.filter((id) => id !== h.id);
      if (prev.length >= 3) {
        toast.error('You can compare up to 3 hospitals at a time');
        return prev;
      }
      return [...prev, h.id];
    });
  };

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialty((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  return (
    <div className="px-6 py-6 xl:px-10 2xl:px-16 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Smart Hospital Finder</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          AI-ranked hospitals matched to your symptoms, insurance plan, and location
        </p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              placeholder="Describe your symptoms or condition (e.g. 'chest pain and shortness of breath')"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                className="input-field pl-9 pr-8 py-2.5 appearance-none cursor-pointer text-sm"
                value={distanceRadius}
                onChange={(e) => setDistanceRadius(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 30, 50].map((d) => (
                  <option key={`dist-${d}`} value={d}>{d} km radius</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                className="input-field pl-9 pr-8 py-2.5 appearance-none cursor-pointer text-sm"
                value={selectedInsurance}
                onChange={(e) => setSelectedInsurance(e.target.value)}
              >
                <option value="">All Insurance</option>
                {insuranceOptions.map((ins) => (
                  <option key={`ins-opt-${ins}`} value={ins}>{ins}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-primary text-primary' : ''}`}
            >
              <Filter size={14} />
              Filters
              {(inNetworkOnly || nabh || minClaimRate > 0) && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
            <button
              className="btn-primary"
              onClick={() => toast.success(`Found ${filteredHospitals.length} hospitals matching your criteria`)}
            >
              <Search size={14} />
              Find Hospitals
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Specialty Filter */}
              <div>
                <p className="section-label mb-2">Specialty</p>
                <div className="flex flex-wrap gap-1.5">
                  {specialtyOptions.map((spec) => (
                    <button
                      key={`spec-filter-${spec}`}
                      onClick={() => toggleSpecialty(spec)}
                      className={`badge cursor-pointer transition-all duration-150 ${
                        selectedSpecialty.includes(spec)
                          ? 'bg-primary/15 text-primary border border-primary/30' :'bg-muted text-muted-foreground hover:bg-secondary border border-transparent'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Toggles */}
              <div>
                <p className="section-label mb-2">Quick Filters</p>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <button
                      role="switch"
                      aria-checked={inNetworkOnly}
                      onClick={() => setInNetworkOnly(!inNetworkOnly)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        inNetworkOnly ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          inNetworkOnly ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground font-medium">In-Network Only</span>
                    <span className="badge-positive text-xs">Saves ~40% cost</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <button
                      role="switch"
                      aria-checked={nabh}
                      onClick={() => setNabh(!nabh)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        nabh ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          nabh ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-foreground font-medium">NABH Accredited Only</span>
                  </label>
                </div>
              </div>

              {/* Min Claim Rate */}
              <div>
                <p className="section-label mb-2">
                  Min. Claim Acceptance Rate:{' '}
                  <span className="text-primary tabular-nums">{minClaimRate}%</span>
                </p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minClaimRate}
                  onChange={(e) => setMinClaimRate(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Symptom Analysis Banner */}
      <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-2xl mb-6">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Stethoscope size={16} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-0.5">
            AI Symptom Analysis — Cardiology specialist recommended
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Based on &quot;chest pain and high blood pressure&quot;, AI suggests prioritizing <strong>Cardiology</strong> and{' '}
            <strong>Pulmonology</strong> departments. Your Star Health policy covers up to ₹5,00,000 for cardiac procedures.
            Estimated out-of-pocket: <span className="font-semibold text-primary">₹1,300–₹5,040</span> at in-network hospitals.
          </p>
        </div>
        <span className="badge-accent text-xs flex-shrink-0">AI Analysis</span>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {filteredHospitals.length} hospitals found
          </p>
          <span className="text-xs text-muted-foreground">within {distanceRadius} km · {selectedInsurance || 'all insurance'}</span>
          {compareList.length > 0 && (
            <span className="badge-info text-xs">
              {compareList.length} selected for comparison
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Sort by:</p>
          <div className="flex items-center gap-1 flex-wrap">
            {sortOptions.map((opt) => (
              <button
                key={`sort-${opt.value}`}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  sortBy === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compare Bar */}
      {compareList.length >= 2 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl mb-4 fade-in">
          <p className="text-sm font-semibold text-primary">
            {compareList.length} hospitals selected for comparison
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareList([])}
              className="btn-ghost text-xs"
            >
              <X size={12} /> Clear
            </button>
            <button
              onClick={() => toast.success('Opening side-by-side comparison view…')}
              className="btn-primary text-xs py-1.5"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Hospital Cards Grid */}
      {loading ? (
        <LoadingState label="Loading hospitals from Supabase…" rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {filteredHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onBook={handleBook}
              onCompare={handleCompare}
              isComparing={compareList.includes(hospital.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Building2 size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">No hospitals found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            No hospitals match your current filters within {distanceRadius} km. Try expanding the distance radius or removing specialty filters.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setDistanceRadius(50); setInNetworkOnly(false); setNabh(false); setMinClaimRate(0); setSelectedSpecialty([]); }}
              className="btn-primary text-sm"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Coverage Summary Footer */}
      <div className="mt-8 card p-5 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Star Health — Family Floater Policy</p>
              <p className="text-xs text-muted-foreground">Policy No: SH-2026-00483921 · Valid till 31 Mar 2027</p>
            </div>
          </div>
          <div className="flex items-center gap-6 ml-auto flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Sum Insured</p>
              <p className="text-sm font-bold tabular-nums text-foreground">₹5,00,000</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilized</p>
              <p className="text-sm font-bold tabular-nums text-warning">₹3,10,000</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-sm font-bold tabular-nums text-positive">₹1,90,000</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Network Hospitals</p>
              <p className="text-sm font-bold tabular-nums text-foreground">2,418</p>
            </div>
            <button className="btn-primary text-xs py-2">
              <IndianRupee size={12} />
              Estimate Coverage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}