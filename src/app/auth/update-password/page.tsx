"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase auto-handles the recovery token from the URL hash
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#137fec]" />
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">link_off</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid or expired link</h1>
          <p className="text-slate-500 text-sm mb-6">This password reset link is no longer valid. Request a new one.</p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 bg-[#137fec] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#137fec]/90"
          >
            Request New Link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-[#137fec] p-2 rounded-lg">
              <span className="material-symbols-outlined text-white text-2xl">anchor</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Arslan</span>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Password updated!</h1>
              <p className="text-slate-500 text-sm">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Set new password</h1>
              <p className="text-slate-500 text-sm mb-6">Enter your new password below.</p>

              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">New Password</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all h-12"
                    placeholder="Min 6 characters"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">Confirm Password</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-[#137fec] focus:ring-1 focus:ring-[#137fec] outline-none transition-all h-12"
                    placeholder="Re-enter password"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-[#137fec]/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
