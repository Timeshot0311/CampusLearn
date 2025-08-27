"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Home,
  LineChart,
  Package,
  MessageSquarePlus,
  Users,
  PanelLeft,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { Role } from "@/services/user-service";


const studentNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/courses", icon: BookOpen, label: "My Courses" },
  { href: "/topics", icon: MessageSquarePlus, label: "Help Topics" },
  { href: "/assignments", icon: ClipboardCheck, label: "Assignments" },
  { href: "/grades", icon: GraduationCap, label: "Grades" },
  { href: "/profile", icon: User, label: "Profile" },
];

const tutorNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/courses", icon: BookOpen, label: "Courses" },
  { href: "/topics", icon: MessageSquarePlus, label: "Help Topics" },
  { href: "/assignments", icon: ClipboardCheck, label: "Submissions" },
  { href: "/grades", icon: GraduationCap, label: "Gradebook" },
  { href: "/analytics", icon: LineChart, label: "Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
];

const lecturerNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/courses", icon: BookOpen, label: "Course Management" },
  { href: "/topics", icon: MessageSquarePlus, label: "Manage Topics" },
  { href: "/assignments", icon: ClipboardCheck, label: "Submissions" },
  { href: "/analytics", icon: LineChart, label: "Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
];

const adminNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/users", icon: Users, label: "User Management" },
  { href: "/courses", icon: Package, label: "Course Management" },
  { href: "/analytics", icon: LineChart, label: "System Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
];

const navItems = {
  student: studentNav,
  tutor: tutorNav,
  lecturer: lecturerNav,
  admin: adminNav,
};

function RoleSwitcher() {
    const { user, roles, setUserRole } = useAuth();
    return (
        <Card className="m-2">
            <CardHeader className="p-4">
                <CardTitle className="text-base">Role Switcher</CardTitle>
                <CardDescription className="text-xs">
                    (For Testing)
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Select
                    value={user.role}
                    onValueChange={(value) => setUserRole(value as Role)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                            <SelectItem key={role} value={role} className="capitalize">
                                {role}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}

function NavContent() {
  const { user } = useAuth();
  const pathname = usePathname();

  const getNavItems = () => {
    if (!user || !user.role) return [];
    return navItems[user.role] || [];
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo />
        </Link>
        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {getNavItems().map((item) => (
             <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  (pathname === item.href || (item.href === "/courses" && pathname.startsWith("/courses/"))) && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto">
        <RoleSwitcher />
      </div>
    </div>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <NavContent />
      </SheetContent>
    </Sheet>
  );
}

export default function AppSidebar() {
  return (
    <div className="hidden border-r bg-background md:block">
        <NavContent />
    </div>
  );
}
