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
    <aside className="w-64 border-r bg-background">
      <div className="p-4 font-bold text-lg border-b">Uni Manager</div>
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Hydrated>
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
          Role: {role}
        </div>
      </Hydrated>
    </aside>
  );
}
