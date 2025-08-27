
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateAssignmentFeedback } from "@/ai/flows/ai-powered-feedback-generator";
import { Loader2 } from "lucide-react";

const studentAssignments = [
  { name: "Quantum Entanglement Essay", course: "Quantum Computing", dueDate: "2024-08-15", status: "Submitted" },
  { name: "Benzene Reactions Lab Report", course: "Organic Chemistry", dueDate: "2024-08-18", status: "In Progress" },
  { name: "Plato's 'Republic' Analysis", course: "Ancient Philosophy", dueDate: "2024-08-22", status: "Not Started" },
  { name: "Problem Set 4", course: "Quantum Computing", dueDate: "2024-09-01", status: "Not Started" },
];

const tutorSubmissions = [
  { student: "Alice Johnson", avatar: "https://i.pravatar.cc/150?u=alice", course: "Quantum Computing", assignment: "Problem Set 3", submitted: "2 hours ago", submission: "The student's submission text for Problem Set 3..." },
  { student: "Bob Williams", avatar: "https://i.pravatar.cc/150?u=bob", course: "Organic Chemistry", assignment: "Lab Report 2", submitted: "5 hours ago", submission: "The student's submission text for Lab Report 2..." },
  { student: "Charlie Brown", avatar: "https://i.pravatar.cc/150?u=charlie", course: "Ancient Philosophy", assignment: "Essay on Stoicism", submitted: "1 day ago", submission: "The student's submission text for the Essay on Stoicism..." },
  { student: "Diana Prince", avatar: "https://i.pravatar.cc/150?u=diana", course: "Quantum Computing", assignment: "Problem Set 3", submitted: "2 days ago", submission: "Another student's submission text for Problem Set 3..." },
  { student: "Ethan Hunt", avatar: "https://i.pravatar.cc/150?u=ethan", course: "Organic Chemistry", assignment: "Lab Report 2", submitted: "3 days ago", submission: "Another student's submission text for Lab Report 2..." },
];

function GradeDialog({ submission }: { submission: (typeof tutorSubmissions)[0] }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [open, setOpen] = useState(false);

  const handleGenerateFeedback = async () => {
    setLoading(true);
    try {
      const result = await generateAssignmentFeedback({
        studentName: submission.student,
        assignmentDescription: submission.assignment,
        studentSubmission: submission.submission,
        tutorFeedbackGuidelines: guidelines,
        courseName: submission.course,
      });
      setFeedback(result.feedback);
    } catch (error) {
      toast({
        title: "Error Generating Feedback",
        description: "There was an error generating feedback. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSubmitGrade = () => {
    // Simulate submitting the grade
    toast({
        title: "Grade Submitted!",
        description: `Feedback for ${submission.student} has been saved.`
    });
    setOpen(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Grade</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Grade Assignment: {submission.assignment}</DialogTitle>
          <DialogDescription>Student: {submission.student} | Course: {submission.course}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg"><strong>Submission:</strong> {submission.submission}</p>
          <div className="grid gap-2">
            <Label htmlFor="guidelines">Feedback Guidelines (Optional)</Label>
            <Textarea 
                id="guidelines" 
                placeholder="e.g., Focus on their understanding of the core concepts." 
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerateFeedback} disabled={loading} className="w-fit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate AI Feedback"}
          </Button>
          <div className="grid gap-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea id="feedback" value={feedback} onChange={e => setFeedback(e.target.value)} rows={8} placeholder="Generated feedback will appear here."/>
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleSubmitGrade} disabled={!feedback}>Submit Grade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
                        <TableRow key={submission.student + submission.assignment}>
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
                                <GradeDialog submission={submission} />
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
