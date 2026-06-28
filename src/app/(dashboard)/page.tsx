"use client";

import { useUser } from "@clerk/nextjs";
import { AdminDashboard } from "@/features/dashboard/admin-dashboard";
import { TeacherDashboard } from "@/features/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/features/dashboard/student-dashboard";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata?.role as string) ?? "Student";

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
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
