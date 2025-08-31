
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateAssignmentFeedback } from "@/ai/flows/ai-powered-feedback-generator";
import { Loader2 } from "lucide-react";
import { Assignment, Submission, getStudentAssignments, getTutorSubmissions, updateSubmission, addSubmission, SubmissionStatus } from "@/services/assignment-service";
import { Course, getCourses, getStudentCourses } from "@/services/course-service";
import { addGrade } from "@/services/grade-service";
import { Input } from "@/components/ui/input";


function SubmitAssignmentDialog({ assignment, onSubmitted }: { assignment: (Assignment & {status: SubmissionStatus}); onSubmitted: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissionContent, setSubmissionContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!submissionContent.trim() || !user) return;
    setLoading(true);
    try {
        await addSubmission({
            studentId: user.id,
            studentName: user.name,
            studentAvatar: user.avatar,
            courseId: assignment.courseId,
            courseTitle: assignment.courseTitle,
            assignmentId: assignment.id,
            assignmentName: assignment.name,
            submittedDate: new Date().toISOString(),
            submissionContent: submissionContent,
        });
        toast({ title: "Assignment Submitted!", description: "Your submission has been received."});
        onSubmitted();
        setOpen(false);
    } catch (error) {
        toast({ title: "Error", description: "Failed to submit assignment.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={assignment.status !== 'In Progress'}>
            {assignment.status === 'Submitted' ? 'Submitted' : 'Submit'}
          </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Submit: {assignment.name}</DialogTitle>
                <DialogDescription>Course: {assignment.courseTitle}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="submission">Your Submission</Label>
                    <Textarea id="submission" rows={10} value={submissionContent} onChange={e => setSubmissionContent(e.target.value)} placeholder="Type your assignment submission here..."/>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={loading || !submissionContent.trim()}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}


function GradeDialog({ submission, onGraded }: { submission: Submission; onGraded: () => void; }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [open, setOpen] = useState(false);

  const handleGenerateFeedback = async () => {
    setLoading(true);
    try {
      const result = await generateAssignmentFeedback({
        studentName: submission.studentName,
        assignmentDescription: submission.assignmentName,
        studentSubmission: submission.submissionContent,
        tutorFeedbackGuidelines: guidelines,
        courseName: submission.courseTitle,
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

  const handleSubmitGrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
        // 1. Add entry to grades collection
        await addGrade({
            studentId: submission.studentId,
            courseId: submission.courseId,
            assignmentId: submission.assignmentId,
            assignmentName: submission.assignmentName,
            courseName: submission.courseTitle,
            grade: grade,
            feedback: feedback,
            gradedBy: user.id,
            date: new Date().toISOString(),
        });
        
        // 2. Update submission status to 'Graded'
        await updateSubmission(submission.id, {
            status: "Graded",
            feedback: feedback,
            grade: grade,
        });

        toast({
            title: "Grade Submitted!",
            description: `Feedback for ${submission.studentName} has been saved.`
        });
        onGraded();
        setOpen(false);

    } catch (error) {
        toast({ title: "Error submitting grade", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Grade</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Grade Assignment: {submission.assignmentName}</DialogTitle>
          <DialogDescription>Student: {submission.studentName} | Course: {submission.courseTitle}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg"><strong>Submission:</strong> {submission.submissionContent}</p>
          
          <div className="grid gap-2">
            <Label htmlFor="grade">Grade</Label>
            <Input id="grade" placeholder="e.g., A+, 85%, Pass" value={grade} onChange={e => setGrade(e.target.value)} />
          </div>

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
          <Button onClick={handleSubmitGrade} disabled={loading || !feedback || !grade}>Submit Grade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StudentAssignments() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<(Assignment & {status: SubmissionStatus})[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchAssignments = useCallback(async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const enrolledCourses = await getStudentCourses(user.id);
            const fetchedAssignments = await getStudentAssignments(user.id, enrolledCourses);
            setAssignments(fetchedAssignments);
        } catch (error) {
             toast({ title: "Error fetching assignments.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [user.id, toast]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);


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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading assignments...</TableCell></TableRow>
            ) : assignments.length === 0 ? (
                 <TableRow><TableCell colSpan={5} className="text-center">No assignments found.</TableCell></TableRow>
            ) : (
                assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.name}</TableCell>
                    <TableCell>{assignment.courseTitle}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>
                    <Badge variant={
                        assignment.status === "Submitted" ? "default" :
                        assignment.status === "Graded" ? "secondary" : "outline"
                    }>{assignment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <SubmitAssignmentDialog assignment={assignment} onSubmitted={fetchAssignments} />
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TutorSubmissions() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchSubmissions = useCallback(async () => {
        if (!user || !user.id || !user.assignedCourses) return;
        try {
            setLoading(true);
            const allCourses = await getCourses();
            const fetchedSubmissions = await getTutorSubmissions(user, allCourses);
            setSubmissions(fetchedSubmissions);
        } catch (error) {
            toast({ title: "Error fetching submissions.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

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
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Loading submissions...</TableCell></TableRow>
                        ) : submissions.length === 0 ? (
                             <TableRow><TableCell colSpan={5} className="text-center">No pending submissions.</TableCell></TableRow>
                        ) : (
                            submissions.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                        <AvatarImage src={submission.studentAvatar} alt={submission.studentName} />
                                        <AvatarFallback>{submission.studentName?.charAt(0) || 'S'}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{submission.studentName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{submission.courseTitle}</TableCell>
                                <TableCell>{submission.assignmentName}</TableCell>
                                <TableCell>{new Date(submission.submittedDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <GradeDialog submission={submission} onGraded={fetchSubmissions} />
                                </TableCell>
                            </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const isTutorOrLecturer = user.role === 'tutor' || user.role === 'lecturer';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">
        {isTutorOrLecturer ? "Submissions" : "Assignments"}
      </h1>
      {isTutorOrLecturer ? <TutorSubmissions /> : <StudentAssignments />}
    </div>
  );
}
