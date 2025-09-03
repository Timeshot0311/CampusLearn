
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, useMemo } from "react";
import { aiTutoringAssistant } from "@/ai/flows/ai-tutoring-assistant";
import { getLearningRecommendations } from "@/ai/flows/learning-recommendations";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Course, getStudentCourses, getCourse } from "@/services/course-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Assignment, getStudentAssignments } from "@/services/assignment-service";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


function CourseCard({ course }: { course: Course }) {
  const [animationDelay, setAnimationDelay] = useState("0s");

  useEffect(() => {
    // This hook ensures the random delay is only generated on the client, preventing hydration mismatch.
    setAnimationDelay(`${Math.random() * 0.5}s`);
  }, []);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <Image
          alt={course.title}
          className="aspect-video w-full object-cover"
          height="300"
          src={course.image}
          width="600"
          data-ai-hint={course.dataAiHint}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-bold font-headline">{course.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Taught by {course.instructor}
        </p>
        <Progress value={course.progress} className="mt-4 animate-progress" style={{ animationDelay }} />
        <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button size="sm" className="w-full" asChild>
            <Link href={`/courses/${course.id}`}>Continue Learning</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export function DashboardStudent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [deadlines, setDeadlines] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorHistory, setTutorHistory] = useState<{ type: 'user' | 'ai'; text: string }[]>([
      { type: 'ai', text: "Hello! Select a course and I can help you with your studies today." }
  ]);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [recommendations, setRecommendations] = useState([
    "Click 'Get New Recommendations' to generate a personalized learning path."
  ]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
        setLoading(true);
        try {
            const fetchedCourses = await getStudentCourses(user.id);
            setEnrolledCourses(fetchedCourses);

            const fetchedAssignments = await getStudentAssignments(user.id, fetchedCourses);
            setDeadlines(fetchedAssignments.filter(a => a.status !== "Submitted" && a.status !== "Graded"));

        } catch (error) {
            toast({
                title: "Error fetching dashboard data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [toast, user?.id]);
  
  useEffect(() => {
    if (selectedCourseId) {
      const fetchCourseDetails = async () => {
        setTutorLoading(true);
        try {
          const courseDetails = await getCourse(selectedCourseId);
          setSelectedCourse(courseDetails);
        } catch (error) {
          toast({ title: "Error fetching course details", variant: "destructive" });
        } finally {
          setTutorLoading(false);
        }
      };
      fetchCourseDetails();
    }
  }, [selectedCourseId, toast]);


  const handleAskTutor = async () => {
    if (!tutorQuestion.trim() || !selectedCourse) return;
    
    const currentQuestion = tutorQuestion;
    setTutorHistory(prev => [...prev, { type: 'user' as const, text: currentQuestion }]);
    setTutorQuestion("");
    setTutorLoading(true);
    
    try {
      const result = await aiTutoringAssistant({
        question: currentQuestion,
        course: selectedCourse,
      });
      setTutorHistory(prev => [...prev, { type: 'ai', text: result.answer }]);
    } catch (error) {
      toast({
        title: "Error Getting Answer",
        description: "There was an error getting an answer from the AI tutor. Please try again.",
        variant: "destructive",
      });
      // Put the user's question back in the input if the AI fails
      setTutorQuestion(currentQuestion);
      setTutorHistory(prev => prev.slice(0, -1)); // Remove the user's last message from history
    }
    setTutorLoading(false);
  };
  
  const handleGetRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
        const result = await getLearningRecommendations({
            studentId: "123",
            courseId: "CS101",
            pastProgress: "Completed Module 1-4 with an average score of 85%. Struggled with Quantum Superposition concepts in Quiz 2.",
            courseObjectives: "Understand the fundamentals of Quantum Computing, including superposition, entanglement, and basic quantum algorithms.",
            modules: "Module 1: Intro to QC, Module 2: Superposition, Module 3: Entanglement, Module 4: Quantum Gates, Module 5: Quantum Algorithms, Module 6: Quantum Hardware."
        });
        setRecommendations([result.reasoning, ...result.recommendedModules]);
    } catch (error) {
        toast({
            title: "Error Getting Recommendations",
            description: "There was an error fetching new recommendations. Please try again.",
            variant: "destructive",
        });
    }
    setRecommendationsLoading(false);
  };


  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold font-headline mb-4">My Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {loading ? (
                Array.from({length: 2}).map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="w-full h-56"/></CardContent></Card>
                ))
            ) : (
                enrolledCourses.slice(0,2).map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Deadlines</CardTitle>
            <CardDescription>
              Stay on top of your assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="hidden sm:table-cell">Course</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Loading deadlines...</TableCell></TableRow>
                 ) : deadlines.length > 0 ? (
                    deadlines.map((deadline) => (
                        <TableRow key={deadline.id}>
                            <TableCell className="font-medium">{deadline.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">{deadline.courseTitle}</TableCell>
                            <TableCell>{deadline.dueDate}</TableCell>
                            <TableCell className="text-right">
                            <Badge variant="secondary">{deadline.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))
                 ) : (
                    <TableRow><TableCell colSpan={4} className="text-center">No upcoming deadlines.</TableCell></TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary"/>
                    <CardTitle className="font-headline">AI Tutoring Assistant</CardTitle>
                </div>
                 <Select onValueChange={setSelectedCourseId} disabled={tutorLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course for context..." />
                  </SelectTrigger>
                  <SelectContent>
                    {enrolledCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <div className="flex-grow space-y-4 overflow-y-auto p-4 bg-muted/50 rounded-lg">
                    {tutorHistory.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                            {message.type === 'ai' && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`p-3 rounded-lg max-w-[85%] ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                            {message.type === 'user' && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>You</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                     {tutorLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <div className="p-3 rounded-lg bg-background flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
                 <Textarea 
                    placeholder="Type your question here..." 
                    className="min-h-[80px]" 
                    value={tutorQuestion}
                    onChange={(e) => setTutorQuestion(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAskTutor();
                        }
                    }}
                    disabled={!selectedCourseId || tutorLoading}
                 />
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleAskTutor} disabled={tutorLoading || !selectedCourseId || !tutorQuestion.trim()}>
                    {tutorLoading ? "Thinking..." : "Ask AI"}
                </Button>
            </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Learning Recommendations</CardTitle>
            <CardDescription>
              Personalized suggestions to help you succeed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5 text-sm">
                {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleGetRecommendations} disabled={recommendationsLoading}>
              {recommendationsLoading ? "Generating..." : "Get New Recommendations"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
