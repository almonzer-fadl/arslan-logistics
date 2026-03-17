"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        // On token refresh failure, Supabase fires SIGNED_OUT
        if (event === "SIGNED_OUT") {
          const params = new URLSearchParams({ expired: "1" });
          router.push(`/auth/login?${params.toString()}`);
        }
      }
    });

    // Also check session validity on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        const params = new URLSearchParams({ expired: "1" });
        router.push(`/auth/login?${params.toString()}`);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}
