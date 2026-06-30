"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAbility } from "@/features/auth/hooks/use-ability";
import type { Subject } from "@/permissions";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  ImageIcon,
  BookMarked,
  Trophy,
  TableProperties,
  FileSpreadsheet,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  subject: Subject;
  action: "read" | "manage";
};

const allNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, subject: "Dashboard", action: "read" },
  { href: "/students", label: "Students", icon: Users, subject: "Student", action: "read" },
  { href: "/teachers", label: "Teachers", icon: GraduationCap, subject: "Teacher", action: "read" },
  { href: "/courses", label: "Courses", icon: BookOpen, subject: "Course", action: "read" },
  { href: "/enrollments", label: "Enrollments", icon: ClipboardList, subject: "Enrollment", action: "read" },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, subject: "Attendance", action: "read" },
  { href: "/course-offerings", label: "Course Offerings", icon: TableProperties, subject: "CourseOffering", action: "read" },
  { href: "/exam-results", label: "Exam Results", icon: FileSpreadsheet, subject: "ExamResult", action: "read" },
  { href: "/posters", label: "Posters", icon: ImageIcon, subject: "Poster", action: "read" },
  { href: "/my-courses", label: "My Courses", icon: BookMarked, subject: "MyEnrollments", action: "read" },
  { href: "/my-grades", label: "My Grades", icon: Trophy, subject: "MyGrades", action: "read" },
];

export function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { ability, role, isLoading } = useAbility();

  useEffect(() => { setMounted(true); }, []);

  const navItems = mounted
    ? allNavItems.filter((item) => ability?.can(item.action, item.subject) ?? false)
    : [];

  return (
    <aside className="w-64 border-r bg-sidebar flex flex-col">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 h-14 shrink-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
          U
        </div>
        <span className="font-bold text-base text-sidebar-foreground">UniManager</span>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-primary-foreground" />
              )}
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <span className="text-xs text-sidebar-foreground/50">
          {isLoading ? "Loading..." : `Role: ${role ?? "Unknown"}`}
        </span>
      </div>
    </aside>
  );
}