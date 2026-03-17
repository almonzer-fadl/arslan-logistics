"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#137fec]" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-row overflow-hidden">
      {/* Left — Form */}
      <section className="flex w-full lg:w-[40%] flex-col bg-white px-8 py-12 md:px-16 lg:px-20 justify-between">
        <div className="flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-[#137fec] p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-3xl">anchor</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">Arslan</span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-4xl">
              Welcome back to Arslan
            </h1>
            <p className="text-slate-500 text-base">Enter your credentials to access your dashboard.</p>
          </div>

          {/* Session Expired */}
          {isExpired && (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-lg p-3 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              Your session has expired. Please sign in again.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Business Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all h-12"
                  placeholder="name@company.com"
                  type="email"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Password</span>
                  <Link className="text-xs font-medium text-[#137fec] hover:underline" href="/auth/forgot-password">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all h-12"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer select-none"
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </button>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input className="h-5 w-5 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]" id="remember" type="checkbox" />
              <label className="text-sm text-slate-600 select-none cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* SSO */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 py-3 rounded-lg transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-3 border border-slate-200 hover:bg-slate-50 py-3 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-slate-600">key</span>
              <span className="text-sm font-medium text-slate-700">Single Sign-On</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center lg:text-left">
          <p className="text-sm text-slate-500">
            New to Arslan? <Link className="text-[#137fec] font-bold hover:underline" href="/auth/register">Create an account</Link>
          </p>
        </div>
      </section>

      {/* Right — Visual */}
      <section className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-[#137fec]/30 via-slate-900/60 to-slate-900" />
        <div className="relative flex flex-col items-start justify-end p-20 w-full h-full">
          <div className="max-w-xl">
            <div className="bg-[#137fec]/30 backdrop-blur-md inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Global Network
            </div>
            <h2 className="text-5xl font-black text-white leading-tight mb-4">
              Streamlining <br />
              <span className="text-[#137fec]">Global Trade.</span>
            </h2>
            <p className="text-slate-200 text-lg leading-relaxed mb-8">
              Manage your carrier links, quotes, and international shipments with the world&apos;s most intuitive sea freight logistics portal.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold text-white">40k+</div>
                <div className="text-sm text-slate-300">Shipments/Mo</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">120+</div>
                <div className="text-sm text-slate-300">Countries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm text-slate-300">Uptime SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
