"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getProfile, signOut } from "@/lib/supabase/api";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { SettingsSkeleton } from "@/components/ui/Skeleton";

export default function SettingsPage() {
  const { t } = useTranslation();
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
      setMessage({ type: "success", text: t.settings.profileUpdated });
    } catch (e) {
      console.error("Error updating profile:", e);
      setMessage({ type: "error", text: t.settings.profileUpdateFailed });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: t.settings.passwordMinLength });
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: "success", text: t.settings.passwordChanged });
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t.settings.passwordChangeFailed;
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
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t.settings.pageTitle}</h1>
      <p className="text-slate-500 mb-8">{t.settings.pageSubtitle}</p>

      {/* Status Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200" : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">person</span>
          {t.settings.profile}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">{t.settings.email}</label>
            <input type="email" readOnly value={profile?.email || ""} className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-elevated text-slate-500 dark:text-slate-400 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">{t.settings.fullName}</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg text-sm focus:ring-[#137fec] focus:border-[#137fec]" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">{t.settings.role}</label>
            <input type="text" readOnly value={profile?.role || "viewer"} className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg bg-slate-50 dark:bg-dark-elevated text-slate-500 dark:text-slate-400 text-sm capitalize" />
          </div>
          <button onClick={updateProfile} disabled={saving} className="px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-semibold hover:bg-[#137fec]/90 disabled:opacity-50">
            {saving ? t.settings.saving : t.settings.saveChanges}
          </button>
        </div>
      </section>

      {/* Security Section */}
      {!isViewer && (
        <section className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            {t.settings.security}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">{t.settings.newPassword}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-dark-border rounded-lg text-sm focus:ring-[#137fec] focus:border-[#137fec]" placeholder={t.settings.newPasswordPlaceholder} />
            </div>
            <button onClick={changePassword} disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
              {t.settings.changePassword}
            </button>
          </div>
        </section>
      )}

      {/* Encryption */}
      <section className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">enhanced_encryption</span>
          {t.settings.encryption}
        </h3>
        <p className="text-sm text-slate-500 mb-4">{t.settings.encryptionDescription}</p>
        <div className="bg-slate-50 dark:bg-dark-elevated rounded-lg p-4 border border-slate-200 dark:border-dark-border">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t.settings.encryptionStatus}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">{t.settings.encryptionActive}</span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white dark:bg-dark-card rounded-xl border border-red-200 dark:border-red-900 p-6">
        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          {t.settings.dangerZone}
        </h3>
        <button onClick={handleSignOut} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100">
          {t.settings.signOut}
        </button>
      </section>
    </div>
  );
}
