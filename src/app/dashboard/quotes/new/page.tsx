"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewQuotePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/quotes?action=new");
  }, [router]);
  return null;
}
