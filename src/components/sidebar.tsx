"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
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

type Role = "Admin" | "Teacher" | "Student";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
};

const allNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Teacher", "Student"] },
  { href: "/students", label: "Students", icon: Users, roles: ["Admin", "Teacher"] },
  { href: "/teachers", label: "Teachers", icon: GraduationCap, roles: ["Admin"] },
  { href: "/courses", label: "Courses", icon: BookOpen, roles: ["Admin", "Teacher", "Student"] },
  { href: "/enrollments", label: "Enrollments", icon: ClipboardList, roles: ["Admin", "Teacher"] },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck, roles: ["Admin", "Teacher"] },
  { href: "/course-offerings", label: "Course Offerings", icon: TableProperties, roles: ["Admin"] },
  { href: "/exam-results", label: "Exam Results", icon: FileSpreadsheet, roles: ["Admin", "Teacher"] },
  { href: "/posters", label: "Posters", icon: ImageIcon, roles: ["Admin", "Teacher", "Student"] },
  { href: "/my-courses", label: "My Courses", icon: BookMarked, roles: ["Student"] },
  { href: "/my-grades", label: "My Grades", icon: Trophy, roles: ["Student"] },
];

function Hydrated({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  if (!hydrated) return null;
  return children;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as Role) ?? "Student";
  const navItems = allNavItems.filter((item) => item.roles.includes(role));

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
      <Hydrated>
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <span className="text-xs text-sidebar-foreground/50">Role: {role}</span>
        </div>
      </Hydrated>
    </aside>
  );
}
