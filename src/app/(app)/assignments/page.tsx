
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const studentAssignments = [
  { name: "Quantum Entanglement Essay", course: "Quantum Computing", dueDate: "2024-08-15", status: "Submitted" },
  { name: "Benzene Reactions Lab Report", course: "Organic Chemistry", dueDate: "2024-08-18", status: "In Progress" },
  { name: "Plato's 'Republic' Analysis", course: "Ancient Philosophy", dueDate: "2024-08-22", status: "Not Started" },
  { name: "Problem Set 4", course: "Quantum Computing", dueDate: "2024-09-01", status: "Not Started" },
];

const tutorSubmissions = [
  { student: "Alice Johnson", avatar: "https://i.pravatar.cc/150?u=alice", course: "Quantum Computing", assignment: "Problem Set 3", submitted: "2 hours ago" },
  { student: "Bob Williams", avatar: "https://i.pravatar.cc/150?u=bob", course: "Organic Chemistry", assignment: "Lab Report 2", submitted: "5 hours ago" },
  { student: "Charlie Brown", avatar: "https://i.pravatar.cc/150?u=charlie", course: "Ancient Philosophy", assignment: "Essay on Stoicism", submitted: "1 day ago" },
  { student: "Diana Prince", avatar: "https://i.pravatar.cc/150?u=diana", course: "Quantum Computing", assignment: "Problem Set 3", submitted: "2 days ago" },
  { student: "Ethan Hunt", avatar: "https://i.pravatar.cc/150?u=ethan", course: "Organic Chemistry", assignment: "Lab Report 2", submitted: "3 days ago" },
];

function StudentAssignments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Assignments</CardTitle>
        <CardDescription>Here is a list of your upcoming and past assignments.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentAssignments.map((assignment) => (
              <TableRow key={assignment.name}>
                <TableCell className="font-medium">{assignment.name}</TableCell>
                <TableCell>{assignment.course}</TableCell>
                <TableCell>{assignment.dueDate}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={
                    assignment.status === "Submitted" ? "default" :
                    assignment.status === "In Progress" ? "secondary" : "outline"
                  }>{assignment.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TutorSubmissions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Submissions</CardTitle>
                <CardDescription>Review the latest assignments submitted by your students.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Assignment</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tutorSubmissions.map((submission) => (
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
                            <TableCell>{submission.submitted}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm">Grade</Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const isTutor = user.role === 'tutor';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">
        {isTutor ? "Submissions" : "Assignments"}
      </h1>
      {isTutor ? <TutorSubmissions /> : <StudentAssignments />}
    </div>
  );
}
