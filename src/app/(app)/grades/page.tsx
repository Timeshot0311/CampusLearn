
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Grade, TutorGradebookEntry, getStudentGrades, getTutorGradebook } from "@/services/grade-service";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

function StudentGrades() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                // In a real app, you'd pass a real user ID
                const fetchedGrades = await getStudentGrades("student-id-placeholder");
                setGrades(fetchedGrades);
            } catch (error) {
                toast({ title: "Error fetching grades.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, [toast]);

    return (
        <Card>
            <CardHeader>
            <CardTitle>My Grade Report</CardTitle>
            <CardDescription>A summary of your performance across all courses.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4}>Loading grades...</TableCell></TableRow>
                ) : (
                    grades.map((grade) => (
                        <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.assignment}</TableCell>
                        <TableCell>{grade.course}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{grade.grade}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{grade.score}</TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
}

function TutorGradebook() {
    const [gradebook, setGradebook] = useState<TutorGradebookEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();
    
    useEffect(() => {
        const fetchGradebook = async () => {
            try {
                 // In a real app, you'd pass a real user ID
                const fetchedGradebook = await getTutorGradebook("tutor-id-placeholder");
                setGradebook(fetchedGradebook);
            } catch (error) {
                toast({ title: "Error fetching gradebook.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchGradebook();
    }, [toast]);

    return (
         <Card>
            <CardHeader>
            <CardTitle>Student Gradebook</CardTitle>
            <CardDescription>An overview of grades submitted for your courses.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                     <TableRow><TableCell colSpan={4}>Loading gradebook...</TableCell></TableRow>
                ) : (
                    gradebook.map((grade) => (
                        <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.student}</TableCell>
                        <TableCell>{grade.course}</TableCell>
                        <TableCell>{grade.assignment}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant="secondary">{grade.grade}</Badge>
                        </TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
}

export default function GradesPage() {
    const { user } = useAuth();
    const isTutor = user.role === "tutor";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">{isTutor ? "Gradebook" : "Grades"}</h1>
      {isTutor ? <TutorGradebook /> : <StudentGrades />}
    </div>
  );
}
