"use client";

import { useUser } from "@clerk/nextjs";

export function TeacherDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome, {user?.fullName || "Teacher"}
      </h1>
      <p className="text-muted-foreground">Your teaching dashboard will display course offerings, upcoming exams, and student progress once connected to the database.</p>
    </div>
  );
}
