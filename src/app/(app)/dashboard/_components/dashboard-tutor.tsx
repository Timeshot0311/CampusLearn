"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileEdit, Lightbulb } from "lucide-react";

const recentSubmissions = [
  {
    student: "Alice Johnson",
    avatar: "https://i.pravatar.cc/150?u=alice",
    course: "Quantum Computing",
    assignment: "Problem Set 3",
    submitted: "2 hours ago",
  },
  {
    student: "Bob Williams",
    avatar: "https://i.pravatar.cc/150?u=bob",
    course: "Organic Chemistry",
    assignment: "Lab Report 2",
    submitted: "5 hours ago",
  },
  {
    student: "Charlie Brown",
    avatar: "https://i.pravatar.cc/150?u=charlie",
    course: "Ancient Philosophy",
    assignment: "Essay on Stoicism",
    submitted: "1 day ago",
  },
];

const performanceData = [
  { name: 'Quiz 1', avgScore: 78 },
  { name: 'Midterm', avgScore: 85 },
  { name: 'Quiz 2', avgScore: 82 },
  { name: 'P. Set 3', avgScore: 91 },
  { name: 'Final', avgScore: 88 },
];

export function DashboardTutor() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Total Students</CardTitle>
                    <CardDescription>Across all your courses</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">128</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Pending Submissions</CardTitle>
                    <CardDescription>Assignments needing review</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">14</p>
                </CardContent>
            </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Submissions</CardTitle>
            <CardDescription>
              Latest assignments submitted by your students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map((submission) => (
                  <TableRow key={submission.student}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={submission.avatar} alt={submission.student} />
                          <AvatarFallback>{submission.student.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{submission.student}</span>
                      </div>
                    </TableCell>
                    <TableCell>{submission.course}</TableCell>
                    <TableCell>{submission.assignment}</TableCell>
                    <TableCell className="text-right">{submission.submitted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Student Performance</CardTitle>
            <CardDescription>Average scores on recent assessments.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary"/>
                <CardTitle className="font-headline">Smart Quiz Generation</CardTitle>
            </div>
            <CardDescription>
              Auto-generate practice quizzes from your learning materials.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">Create Quiz</Button>
          </CardFooter>
        </Card>
         <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <FileEdit className="h-6 w-6 text-primary"/>
                <CardTitle className="font-headline">AI Feedback Generator</CardTitle>
            </div>
            <CardDescription>
              Draft personalized feedback for student assignments.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">Generate Feedback</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
