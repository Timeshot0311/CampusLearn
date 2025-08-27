
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const grades = [
  { assignment: "Problem Set 1", course: "Quantum Computing", grade: "A-", score: "92/100" },
  { assignment: "Lab Report 1", course: "Organic Chemistry", grade: "B+", score: "88/100" },
  { assignment: "Midterm Exam", course: "Ancient Philosophy", grade: "A", score: "95/100" },
  { assignment: "Problem Set 2", course: "Quantum Computing", grade: "B", score: "85/100" },
  { assignment: "Essay on Socrates", course: "Ancient Philosophy", grade: "A-", score: "91/100" },
];

const tutorGradebook = [
    { student: "Alice Johnson", course: "Quantum Computing", assignment: "Problem Set 3", grade: "A" },
    { student: "Bob Williams", course: "Organic Chemistry", assignment: "Lab Report 2", grade: "B+" },
    { student: "Charlie Brown", course: "Ancient Philosophy", assignment: "Essay on Stoicism", grade: "A-" },
    { student: "Diana Prince", course: "Quantum Computing", assignment: "Problem Set 3", grade: "B" },
]

function StudentGrades() {
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
                {grades.map((grade) => (
                    <TableRow key={grade.assignment}>
                    <TableCell className="font-medium">{grade.assignment}</TableCell>
                    <TableCell>{grade.course}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">{grade.grade}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{grade.score}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
}

function TutorGradebook() {
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
                {tutorGradebook.map((grade) => (
                    <TableRow key={grade.student + grade.assignment}>
                    <TableCell className="font-medium">{grade.student}</TableCell>
                    <TableCell>{grade.course}</TableCell>
                    <TableCell>{grade.assignment}</TableCell>
                    <TableCell className="text-right">
                         <Badge variant="secondary">{grade.grade}</Badge>
                    </TableCell>
                    </TableRow>
                ))}
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
