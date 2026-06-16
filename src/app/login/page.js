'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Check if there are error parameters in URL
  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      toast.error(errorMsg);
    }
  }, [searchParams]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Logged in successfully!');
          router.push('/');
          router.refresh();
        }
      } else {
        // Sign Up
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          toast.error(error.message);
        } else {
          if (data?.user?.identities?.length === 0) {
            toast.error('An account with this email already exists.');
          } else {
            toast.success('Verification link sent! Please check your email.');
          }
        }
      }
    } catch (err) {
      toast.error('Authentication failed. Please try again.');
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error('Google login failed.');
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          TaxFlow GST
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          {isLogin ? 'Sign in to generate and manage GST invoices' : 'Create an account to get started'}
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
        <button
          id="tab-login"
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          id="tab-signup"
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            !isLogin ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Auth Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Mail className="h-5 w-5" />
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Lock className="h-5 w-5" />
            </span>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0f172a] px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      {/* Social Authentication */}
      <button
        id="google-auth-btn"
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200 bg-slate-950 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50"
      >
        {googleLoading ? (
          <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
        ) : (
          <>
            {/* Custom Google SVG Icon */}
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500 mt-6">
        Secured by Supabase Authentication. By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          <p className="text-sm text-slate-400 mt-4">Loading application...</p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </main>
  );
}
