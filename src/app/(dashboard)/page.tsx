"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/features/dashboard/admin-dashboard";
import { TeacherDashboard } from "@/features/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/features/dashboard/student-dashboard";
import { useAbility } from "@/features/auth/hooks/use-ability";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { ability, role, isLoading } = useAbility();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLoading && !role) {
      router.replace("/complete-profile");
    }
  }, [mounted, isLoading, role, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  switch (role) {
    case "Admin":
      return <AdminDashboard />;
    case "Teacher":
      return <TeacherDashboard />;
    default:
      return <StudentDashboard />;
  }
}
