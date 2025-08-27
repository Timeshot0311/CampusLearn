"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from "recharts";

const coursePopularityData = [
  { name: 'Quantum Comp', students: 45 },
  { name: 'Org. Chem', students: 62 },
  { name: 'Philosophy', students: 38 },
  { name: 'Finance', students: 55 },
  { name: 'AI Ethics', students: 78 },
];

const systemUsageData = [
  { month: 'Jan', activeUsers: 800 },
  { month: 'Feb', activeUsers: 950 },
  { month: 'Mar', activeUsers: 1100 },
  { month: 'Apr', activeUsers: 1050 },
  { month: 'May', activeUsers: 1250 },
  { month: 'Jun', activeUsers: 1400 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Course Popularity</CardTitle>
                <CardDescription>Number of students enrolled in each course.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coursePopularityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12}/>
                    <Tooltip />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>System Usage</CardTitle>
                <CardDescription>Monthly active users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={systemUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="activeUsers" stroke="hsl(var(--primary))" />
                </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
