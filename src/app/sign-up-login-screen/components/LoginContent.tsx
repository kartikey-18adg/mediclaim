'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, ArrowRight, Shield,
  Building2, User, FileText, Stethoscope,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

type Role = 'patient' | 'hospital' | 'insurer';
type AuthMode = 'login' | 'signup';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  policyNumber?: string;
  hospitalId?: string;
  agreeTerms: boolean;
}

const roleConfig: Record<Role, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  patient: {
    label: 'Patient',
    icon: <User size={16} />,
    description: 'Manage claims, health records & vitals',
    color: 'text-primary',
  },
  hospital: {
    label: 'Hospital Admin',
    icon: <Building2 size={16} />,
    description: 'Process billing, verify documents & claims',
    color: 'text-accent',
  },
  insurer: {
    label: 'Insurance Analyst',
    icon: <Shield size={16} />,
    description: 'Review, approve & audit insurance claims',
    color: 'text-warning',
  },
};

export default function LoginContent() {
  const router = useRouter();
  const { user, loading, signUp, signIn } = useAuth();

  const [role, setRole] = useState<Role>('patient');
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData & SignupFormData>();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginFormData & SignupFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const { user: authUser, error } = await signIn(data.email, data.password);
        if (error) {
          toast.error(error.message || 'Sign in failed');
          setIsSubmitting(false);
          return;
        }
        if (authUser) {
          toast.success(`Welcome back! Signing in as ${data.email}…`);
          // Router will automatically redirect via AppLayout
          setIsSubmitting(false);
          return;
        }
      } else {
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          setIsSubmitting(false);
          return;
        }

        const { user: authUser, error } = await signUp(data.email, data.password);
        if (error) {
          toast.error(error.message || 'Sign up failed');
          setIsSubmitting(false);
          return;
        }
        if (authUser) {
          toast.success('Account created successfully! Check your email to confirm.');
          reset();
          setMode('login');
          setIsSubmitting(false);
          return;
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] gradient-primary flex-col justify-between p-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/3" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <AppLogo size={40} />
            <span className="text-2xl font-bold text-white tracking-tight">MediClaim</span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Stethoscope size={12} />
            AI-Powered Medical Claims Platform
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Faster claims.<br />
            Smarter health.<br />
            <span className="text-white/70">All in one place.</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md">
            MediClaim uses OCR and NLP to extract structured data from lab reports, bills, 
            prescriptions, and discharge summaries — automating insurance claim processing 
            for patients, hospitals, and insurers.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3">
            {[
              { icon: <FileText size={14} />, text: 'AI document extraction with 97.4% accuracy' },
              { icon: <Shield size={14} />, text: 'Claim processing in under 48 hours on average' },
              { icon: <Building2 size={14} />, text: '2,400+ hospitals in the MediClaim network' },
            ].map((feat, i) => (
              <div key={`feat-${i}`} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  {feat.icon}
                </div>
                {feat.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-white/50 text-xs">
          <span>© 2026 MediClaim</span>
          <span>IRDAI Registered</span>
          <span>ISO 27001 Certified</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="text-xl font-bold text-foreground">MediClaim</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1 mb-6">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={`mode-${m}`}
                onClick={() => { setMode(m); reset(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  mode === m
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>



          {/* Role Tabs */}
          <div className="mb-6">
            <p className="section-label mb-2">I am a</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(roleConfig) as [Role, typeof roleConfig[Role]][]).map(([key, config]) => (
                <button
                  key={`role-${key}`}
                  onClick={() => setRole(key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-150 ${
                    role === key
                      ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <span className={role === key ? config.color : ''}>{config.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{config.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {roleConfig[role].description}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Full Name <span className="text-negative">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Arjun Mehta"
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
                {errors.fullName && (
                  <p className="text-xs text-negative mt-1">{errors.fullName.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Email Address <span className="text-negative">*</span>
              </label>
              <input
                type="email"
                className="input-field"
                placeholder={
                  role === 'patient' ?'patient@example.com'
                    : role === 'hospital' ?'admin@hospital.com' :'analyst@insurer.com'
                }
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-negative mt-1">{errors.email.message}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Mobile Number <span className="text-negative">*</span>
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  {...register('phone', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Enter a valid 10-digit Indian mobile number',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-xs text-negative mt-1">{errors.phone.message}</p>
                )}
              </div>
            )}

            {mode === 'signup' && role === 'patient' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Policy Number
                  <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Add your existing insurance policy to enable claim tracking
                </p>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. SH-2026-00483921"
                  {...register('policyNumber')}
                />
              </div>
            )}

            {mode === 'signup' && role === 'hospital' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Hospital Registration ID <span className="text-negative">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Your hospital&apos;s MediClaim network registration code
                </p>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. HOSP-MH-00291"
                  {...register('hospitalId', {
                    required: role === 'hospital' ? 'Hospital ID is required' : false,
                  })}
                />
                {errors.hospitalId && (
                  <p className="text-xs text-negative mt-1">{errors.hospitalId.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Password <span className="text-negative">*</span>
              </label>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground mb-1.5">
                  Minimum 8 characters, include uppercase, number and symbol
                </p>
              )}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-negative mt-1">{errors.password.message}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Confirm Password <span className="text-negative">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-negative mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border accent-primary"
                    {...register('rememberMe')}
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm font-semibold text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border accent-primary mt-0.5 flex-shrink-0"
                    {...register('agreeTerms', { required: 'You must accept the terms to continue' })}
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{' '}
                    <button type="button" className="text-primary font-semibold hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-primary font-semibold hover:underline">
                      Privacy Policy
                    </button>
                    . I consent to processing of my health data as per DPDP Act 2023.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-negative mt-1">{errors.agreeTerms.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-sm mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Protected by IRDAI-compliant encryption · ISO 27001 · DPDP Act 2023
          </p>
        </div>
      </div>
    </div>
  );
}
