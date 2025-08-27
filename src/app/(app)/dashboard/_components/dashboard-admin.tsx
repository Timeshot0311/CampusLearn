"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Users, Package, Activity, ArrowUp } from "lucide-react";

const enrollmentData = [
  { month: 'Jan', enrollments: 120 },
  { month: 'Feb', enrollments: 150 },
  { month: 'Mar', enrollments: 210 },
  { month: 'Apr', enrollments: 180 },
  { month: 'May', enrollments: 250 },
  { month: 'Jun', enrollments: 300 },
];

const recentActivity = [
    { action: "New Enrollment", user: "Alice J.", details: "Quantum Computing", time: "2m ago"},
    { action: "Graded", user: "Dr. Reed", details: "Midterm Exam", time: "15m ago"},
    { action: "New Course", user: "Admin", details: "Intro to AI Ethics", time: "1h ago"},
    { action: "User Joined", user: "Mike T.", details: "New student account", time: "3h ago"},
]

export function DashboardAdmin() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid gap-6 md:grid-cols-3 lg:col-span-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,482</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">73</div>
                    <p className="text-xs text-muted-foreground">+5 from last month</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">934</div>
                    <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
            </Card>
        </div>
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Monthly Enrollment Rate</CardTitle>
            <CardDescription>
              New student enrollments across all courses this year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={enrollmentData}>
                    <defs>
                        <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" fill="url(#colorEnrollments)" />
                </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity Log</CardTitle>
            <CardDescription>A stream of recent platform-wide events.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                        {activity.action}: <span className="font-normal text-muted-foreground">{activity.details}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                        by {activity.user} - {activity.time}
                        </p>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
