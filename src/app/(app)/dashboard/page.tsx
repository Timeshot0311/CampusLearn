"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardStudent } from "./_components/dashboard-student";
import { DashboardTutor } from "./_components/dashboard-tutor";
import { DashboardAdmin } from "./_components/dashboard-admin";

export default function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <DashboardStudent />;
      case 'tutor':
      case 'lecturer':
        return <DashboardTutor />;
      case 'admin':
        return <DashboardAdmin />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold font-headline">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Here&apos;s your overview for today.</p>
          </div>
        </div>
      {renderDashboard()}
    </div>
  );
}
