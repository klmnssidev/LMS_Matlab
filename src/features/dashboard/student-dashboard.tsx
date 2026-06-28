"use client";

import { useUser } from "@clerk/nextjs";

export function StudentDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome, {user?.fullName || "Student"}
      </h1>
      <p className="text-muted-foreground">Your student dashboard will display enrolled courses, upcoming exams, and grades once connected to the database.</p>
    </div>
  );
}
