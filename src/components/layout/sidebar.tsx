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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const studentNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/courses", icon: BookOpen, label: "My Courses" },
  { href: "/topics", icon: MessageSquarePlus, label: "Help Topics" },
  { href: "/assignments", icon: ClipboardCheck, label: "Assignments" },
  { href: "/grades", icon: GraduationCap, label: "Grades" },
];

const tutorNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/courses", icon: BookOpen, label: "Courses" },
  { href: "/topics", icon: MessageSquarePlus, label: "Help Topics" },
  { href: "/assignments", icon: ClipboardCheck, label: "Submissions" },
  { href: "/analytics", icon: LineChart, label: "Analytics" },
];

const lecturerNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/courses", icon: BookOpen, label: "Manage Courses" },
  { href: "/topics", icon: MessageSquarePlus, label: "Manage Topics" },
  { href: "/assignments", icon: ClipboardCheck, label: "Submissions" },
  { href: "/analytics", icon: LineChart, label: "Analytics" },
];

const adminNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/users", icon: Users, label: "User Management" },
  { href: "/courses", icon: Package, label: "Course Management" },
  { href: "/analytics", icon: LineChart, label: "System Analytics" },
];

const navItems = {
  student: studentNav,
  tutor: tutorNav,
  lecturer: lecturerNav,
  admin: adminNav,
};

function NavContent() {
  const { user, roles, setUserRole } = useAuth();
  const pathname = usePathname();

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
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {(navItems[user.role] || []).map((item) => (
             <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname.startsWith(item.href) && item.href !== "/" && "bg-muted text-primary",
                  pathname === "/" && item.href === "/" && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Card>
          <CardHeader className="p-2 pt-0 md:p-4">
            <CardTitle className="font-headline text-lg">Role Switcher</CardTitle>
            <CardDescription>
              Simulate different user roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
            <Select onValueChange={(value) => setUserRole(value as Role)} defaultValue={user.role}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
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
