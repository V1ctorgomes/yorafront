"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdminToken } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated() || !isAdminToken()) {
      router.replace("/admin/login");
    }
  }, [router]);

  if (
    typeof window !== "undefined" &&
    (!isAuthenticated() || !isAdminToken())
  ) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
