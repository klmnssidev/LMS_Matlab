"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AdminDashboard } from "@/features/dashboard/admin-dashboard";
import { TeacherDashboard } from "@/features/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/features/dashboard/student-dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const role = (user?.publicMetadata?.role as string) ?? "";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && isLoaded && (role === "" || role === "Unlinked")) {
      router.replace("/complete-profile");
    }
  }, [mounted, isLoaded, role, router]);

  if (!mounted || !isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (role === "" || role === "Unlinked") {
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
