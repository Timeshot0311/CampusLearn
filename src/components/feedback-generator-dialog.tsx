
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAssignmentFeedback } from "@/ai/flows/ai-powered-feedback-generator";

export function FeedbackGeneratorDialog() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [studentSubmission, setStudentSubmission] = useState("");
  const [tutorFeedbackGuidelines, setTutorFeedbackGuidelines] = useState("");
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const result = await generateAssignmentFeedback({
        studentName,
        courseName,
        assignmentDescription,
        studentSubmission,
        tutorFeedbackGuidelines,
      });
      setFeedback(result.feedback);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Feedback",
        description: "There was an issue drafting the feedback. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };
  
  return (
     <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Generate Feedback</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Powered Feedback Generator</DialogTitle>
          <DialogDescription>
            Fill in the details to generate personalized feedback for a student's assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="student-name">Student Name</Label>
                    <Input id="student-name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input id="course-name" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="assignment-desc">Assignment Description</Label>
                <Textarea id="assignment-desc" value={assignmentDescription} onChange={(e) => setAssignmentDescription(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="student-submission">Student's Submission</Label>
                <Textarea id="student-submission" value={studentSubmission} onChange={(e) => setStudentSubmission(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="tutor-guidelines">Tutor Guidelines (Optional)</Label>
                <Textarea id="tutor-guidelines" placeholder="e.g., 'Focus on argument structure and use of evidence.'" value={tutorFeedbackGuidelines} onChange={(e) => setTutorFeedbackGuidelines(e.target.value)} />
            </div>
         
          {feedback && (
             <div className="grid gap-2">
              <Label>Generated Feedback</Label>
              <Textarea readOnly value={feedback} rows={8} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={loading || !studentSubmission}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
