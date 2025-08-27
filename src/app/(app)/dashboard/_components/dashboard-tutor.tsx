
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Submission, getTutorSubmissions } from "@/services/assignment-service";
import { Grade } from "@/services/grade-service";
import { FeedbackGeneratorDialog } from "@/components/feedback-generator-dialog";

const performanceData = [
  { name: 'Quiz 1', avgScore: 78 },
  { name: 'Midterm', avgScore: 85 },
  { name: 'Quiz 2', avgScore: 82 },
  { name: 'P. Set 3', avgScore: 91 },
  { name: 'Final', avgScore: 88 },
];

export function DashboardTutor() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fetchedSubmissions] = await Promise.all([
                    getTutorSubmissions("tutor-id-placeholder"),
                ]);
                setSubmissions(fetchedSubmissions);
            } catch (error) {
                 toast({ title: "Error fetching tutor data", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

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
                    <p className="text-4xl font-bold">{submissions.length}</p>
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
                {loading ? (
                    <TableRow><TableCell colSpan={4}>Loading submissions...</TableCell></TableRow>
                ) : submissions.length > 0 ? (
                    submissions.slice(0, 5).map((submission) => (
                    <TableRow key={submission.id}>
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
                    ))
                ) : (
                    <TableRow><TableCell colSpan={4}>No recent submissions.</TableCell></TableRow>
                )}
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
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary"/>
                    <CardTitle className="font-headline">Feature Moved</CardTitle>
                </div>
                <CardDescription>
                The "Smart Quiz Generation" feature can now be found on the topic detail pages to better associate quizzes with specific learning discussions.
                </CardDescription>
            </CardHeader>
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
            <FeedbackGeneratorDialog />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
