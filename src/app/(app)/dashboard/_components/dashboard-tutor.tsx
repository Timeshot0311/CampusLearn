
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
  DialogFooter,
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
import { FileEdit, Lightbulb, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateQuiz } from "@/ai/flows/smart-quiz-generation";
import { generateAssignmentFeedback } from "@/ai/flows/ai-powered-feedback-generator";
import { Badge } from "@/components/ui/badge";
import { Submission, getTutorSubmissions } from "@/services/assignment-service";
import { Grade, getTutorGradebook } from "@/services/grade-service";

const performanceData = [
  { name: 'Quiz 1', avgScore: 78 },
  { name: 'Midterm', avgScore: 85 },
  { name: 'Quiz 2', avgScore: 82 },
  { name: 'P. Set 3', avgScore: 91 },
  { name: 'Final', avgScore: 88 },
];


function QuizGeneratorDialog() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizJson, setQuizJson] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setQuizJson("");
    try {
      const result = await generateQuiz({
        learningMaterial: material,
        numberOfQuestions: numQuestions,
      });
      setQuizJson(result.quiz);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Quiz",
        description: "There was an issue creating the quiz. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };
  
  return (
     <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Create Quiz</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Smart Quiz Generation</DialogTitle>
          <DialogDescription>
            Paste in any learning material (e.g., lecture notes, article) to automatically generate a practice quiz.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="material">Learning Material</Label>
            <Textarea 
                id="material" 
                placeholder="Paste your content here..." 
                rows={10} 
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Input 
                id="num-questions" 
                type="number" 
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-24"
            />
          </div>
          {quizJson && (
             <div className="grid gap-2">
              <Label>Generated Quiz (JSON)</Label>
              <Textarea readOnly value={quizJson} rows={10} className="font-mono text-xs" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={loading || !material}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FeedbackGeneratorDialog() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [studentSubmission, setStudentSubmission] = useState("");
  const [tutorFeedbackGuidelines, setTutorFeedbackGuidelines] = useState("");

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
     <Dialog>
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

export function DashboardTutor() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fetchedSubmissions, fetchedGrades] = await Promise.all([
                    getTutorSubmissions("tutor-id-placeholder"),
                    getTutorGradebook("tutor-id-placeholder")
                ]);
                setSubmissions(fetchedSubmissions);
                // In a real app, grades would be linked to submissions to determine what is pending
                const gradedAssignmentIds = new Set(fetchedGrades.map(g => g.assignment));
                // setPendingSubmissions(fetchedSubmissions.filter(s => !gradedAssignmentIds.has(s.assignment)));
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
                <CardTitle className="font-headline">Smart Quiz Generation</CardTitle>
            </div>
            <CardDescription>
              Auto-generate practice quizzes from your learning materials.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <QuizGeneratorDialog />
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
            <FeedbackGeneratorDialog />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
