
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Grade, getStudentGrades, getTutorGradebook } from "@/services/grade-service";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { UserProfileHoverCard } from "@/components/user-profile-hover-card";
import { getUser, User } from "@/services/user-service";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function StudentGrades() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!user?.id) return;
        const fetchGrades = async () => {
            try {
                const fetchedGrades = await getStudentGrades(user.id);
                setGrades(fetchedGrades);
            } catch (error) {
                toast({ title: "Error fetching grades.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, [user?.id, toast]);

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
                    <TableHead>Feedback</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Loading grades...</TableCell></TableRow>
                ) : grades.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No grades have been posted yet.</TableCell></TableRow>
                ) : (
                    grades.map((grade) => (
                        <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.assignmentName}</TableCell>
                        <TableCell>{grade.courseName}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{grade.grade}</Badge>
                        </TableCell>
                        <TableCell>{grade.feedback || 'No feedback provided.'}</TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
}

const GradebookRow = ({ grade }: { grade: Grade }) => {
    const [student, setStudent] = useState<User | null>(null);

    useEffect(() => {
        const fetchStudent = async () => {
            const user = await getUser(grade.studentId);
            setStudent(user);
        }
        fetchStudent();
    }, [grade.studentId]);

    if (!student) {
        return (
            <TableRow>
                <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
            </TableRow>
        )
    }

    return (
        <TableRow key={grade.id}>
            <TableCell>
                 <div className="flex items-center gap-3">
                    <UserProfileHoverCard user={student}>
                        <Link href={`/profile/${student.id}`}>
                            <Avatar>
                                <AvatarImage src={student.avatar} />
                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </Link>
                    </UserProfileHoverCard>
                    <div>
                        <UserProfileHoverCard user={student}>
                            <Link href={`/profile/${student.id}`} className="font-medium hover:underline">{student.name}</Link>
                        </UserProfileHoverCard>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>{grade.courseName}</TableCell>
            <TableCell>{grade.assignmentName}</TableCell>
            <TableCell className="text-right">
                <Badge variant="secondary">{grade.grade}</Badge>
            </TableCell>
        </TableRow>
    )
};


function TutorGradebook() {
    const [gradebook, setGradebook] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();
    
    useEffect(() => {
        if (!user?.id) return;
        const fetchGradebook = async () => {
            try {
                const fetchedGradebook = await getTutorGradebook(user);
                setGradebook(fetchedGradebook);
            } catch (error) {
                toast({ title: "Error fetching gradebook.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchGradebook();
    }, [user, toast]);

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
                     <TableRow><TableCell colSpan={4} className="text-center">Loading gradebook...</TableCell></TableRow>
                ) : gradebook.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No grades have been posted for your courses.</TableCell></TableRow>
                ) : (
                    gradebook.map((grade) => (
                       <GradebookRow key={grade.id} grade={grade} />
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
    const isTutorOrLecturer = user.role === "tutor" || user.role === "lecturer";
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">{isTutorOrLecturer ? "Gradebook" : "Grades"}</h1>
      {isTutorOrLecturer ? <TutorGradebook /> : <StudentGrades />}
    </div>
  );
}
