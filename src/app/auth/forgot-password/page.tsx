"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-[#137fec] p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-2xl">anchor</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Arslan</span>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-500 text-3xl">mark_email_read</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
              <p className="text-slate-500 text-sm mb-6">
                We sent a password reset link to <strong className="text-slate-700">{email}</strong>. Click the link in the email to reset your password.
              </p>
              <Link
                href="/auth/login"
                className="text-[#137fec] font-semibold text-sm hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset your password</h1>
              <p className="text-slate-500 text-sm mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Email address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all h-12"
                    placeholder="name@company.com"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-[#137fec]/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-slate-500">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-[#137fec] font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
