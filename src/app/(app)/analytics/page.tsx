"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from "recharts";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Course, getCourses } from "@/services/course-service";
import { User, getUsers } from "@/services/user-service";

const systemUsageData = [
  { month: 'Jan', activeUsers: 800 },
  { month: 'Feb', activeUsers: 950 },
  { month: 'Mar', activeUsers: 1100 },
  { month: 'Apr', activeUsers: 1050 },
  { month: 'May', activeUsers: 1250 },
  { month: 'Jun', activeUsers: 1400 },
];


export default function AnalyticsPage() {
    const { toast } = useToast();
    const [coursePopularityData, setCoursePopularityData] = useState<{name: string, students: number}[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [courses, users] = await Promise.all([getCourses(), getUsers()]);
                
                const popularityData = courses.map(course => ({
                    name: course.title,
                    students: course.enrolledStudents?.length || 0
                }));
                setCoursePopularityData(popularityData);

                const studentUsers = users.filter(user => user.role === 'student');
                setTotalUsers(studentUsers.length);

            } catch (error) {
                toast({ title: "Error fetching analytics data", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);


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
                    <YAxis fontSize={12} allowDecimals={false}/>
                    <Tooltip />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>System Usage</CardTitle>
                <CardDescription>Total number of students on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-5xl font-bold">{loading ? "..." : totalUsers}</p>
                <p className="text-sm text-muted-foreground mt-2">Real-time student count</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
