'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { Loader2, Zap } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Determine mode from query parameters: /login?mode=signup
  const modeParam = searchParams.get('mode');
  const [mode, setMode] = useState(modeParam === 'signup' ? 'signup' : 'signin');
  const [signupDone, setSignupDone] = useState(false);

  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) toast.error(decodeURIComponent(errorMsg));

    const currentMode = searchParams.get('mode');
    if (currentMode === 'signup') {
      setMode('signup');
    } else if (currentMode === 'signin') {
      setMode('signin');
    }
  }, [searchParams]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Signed in successfully');
          localStorage.setItem('user_logged_in', 'true');
          router.push('/');
          router.refresh();
        }
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          toast.error(error.message);
        } else if (data?.user?.identities?.length === 0) {
          toast.error('An account with this email already exists.');
        } else {
          if (data?.user) {
            localStorage.setItem('user_logged_in', 'true');
          }
          setSignupDone(true);
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) toast.error(error.message);
    } catch (err) {
      toast.error('Google sign-in failed.');
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email verification sent screen
  if (signupDone) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#5e6ad2]" stroke="currentColor" strokeWidth={2}>
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-semibold text-[#e2e8f0] mb-1">Check your email</h2>
        <p className="text-[13px] text-[#666] mb-6">
          We sent a verification link to <span className="text-[#999]">{email}</span>. Click it to activate your account.
        </p>
        <button
          onClick={() => { setSignupDone(false); setMode('signin'); }}
          className="text-[13px] text-[#5e6ad2] hover:text-[#7b87e8] transition-colors"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <Image src="/logo.png" alt="TaxFlow Logo" width={26} height={26} className="rounded object-contain" />
        <span className="text-[17px] font-semibold text-[#e2e8f0]">TaxFlow</span>
        <span className="text-[11px] text-[#555] bg-[#1e1e1e] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-medium">GST</span>
      </div>

      {/* Heading */}
      <h1 className="text-[22px] font-semibold text-[#e2e8f0] text-center mb-1">
        {mode === 'signin' ? 'Sign in to TaxFlow' : 'Create your account'}
      </h1>
      <p className="text-[13px] text-[#555] text-center mb-8">
        {mode === 'signin'
          ? 'Generate and manage GST invoices'
          : 'Start creating GST invoices for free'}
      </p>

      {/* Google button */}
      <button
        id="google-auth-btn"
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#222] text-[13px] font-medium text-[#ccc] hover:text-[#e2e8f0] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {googleLoading ? (
          <Loader2 size={15} className="animate-spin text-[#666]" />
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#2a2a2a]" />
        <span className="text-[11px] text-[#444] uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-[#2a2a2a]" />
      </div>

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-[12px] text-[#666] mb-1.5 font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-all"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-[12px] text-[#666] mb-1.5 font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[13px] text-[#e2e8f0] placeholder-[#444] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-all"
          />
          {mode === 'signin' && (
            <div className="flex justify-end mt-1.5">
              <button type="button" className="text-[11px] text-[#555] hover:text-[#888] transition-colors">
                Forgot password?
              </button>
            </div>
          )}
        </div>

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#5e6ad2] hover:bg-[#4f5abf] active:bg-[#4a55b0] text-[13px] font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            mode === 'signin' ? 'Sign in' : 'Create account'
          )}
        </button>
      </form>

      {/* Mode switch */}
      <p className="text-center text-[12px] text-[#555] mt-6">
        {mode === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              id="tab-signup"
              onClick={() => setMode('signup')}
              className="text-[#5e6ad2] hover:text-[#7b87e8] transition-colors font-medium"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              id="tab-login"
              onClick={() => setMode('signin')}
              className="text-[#5e6ad2] hover:text-[#7b87e8] transition-colors font-medium"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-[#5e6ad2]" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>

      {/* Footer */}
      <p className="absolute bottom-6 text-[11px] text-[#333]">
        Secured by Supabase · © {new Date().getFullYear()} TaxFlow
      </p>
    </main>
  );
}
