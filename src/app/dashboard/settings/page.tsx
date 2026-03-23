"use client";

import { useEffect, useState } from "react";
import { getProfile, signOut } from "@/lib/supabase/api";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { SettingsSkeleton } from "@/components/ui/Skeleton";

export default function SettingsPage() {
  const router = useRouter();
  const { isViewer } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      if (p) setFullName(p.full_name || "");
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", profile.id);
      if (error) throw error;
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (e) {
      console.error("Error updating profile:", e);
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to change password.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Settings</h1>
      <p className="text-slate-500 mb-8">Manage your account, security, and preferences.</p>

      {/* Status Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">person</span>
          Profile
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
            <input type="email" readOnly value={profile?.email || ""} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-[#137fec] focus:border-[#137fec]" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Role</label>
            <input type="text" readOnly value={profile?.role || "viewer"} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm capitalize" />
          </div>
          <button onClick={updateProfile} disabled={saving} className="px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-semibold hover:bg-[#137fec]/90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Security Section */}
      {!isViewer && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            Security
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-[#137fec] focus:border-[#137fec]" placeholder="Enter new password (min 6 chars)" />
            </div>
            <button onClick={changePassword} disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
              Change Password
            </button>
          </div>
        </section>
      )}

      {/* Encryption */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>
          Encryption
        </h3>
        <p className="text-sm text-slate-500 mb-4">Carrier credentials are encrypted with AES-256. The encryption key is stored in your environment variables.</p>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Encryption Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-700">Active — AES-256 encryption enabled</span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl border border-red-200 p-6">
        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          Danger Zone
        </h3>
        <button onClick={handleSignOut} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100">
          Sign Out
        </button>
      </section>
    </div>
  );
}
