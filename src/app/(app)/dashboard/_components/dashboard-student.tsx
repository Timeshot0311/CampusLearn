
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
import { Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { aiTutoringAssistant } from "@/ai/flows/ai-tutoring-assistant";
import { getLearningRecommendations } from "@/ai/flows/learning-recommendations";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const courses = [
  {
    id: "quantum-computing",
    title: "Introduction to Quantum Computing",
    description: "Learn the fundamentals of quantum mechanics and computation.",
    image: "https://picsum.photos/600/400?random=1",
    dataAiHint: "technology abstract",
    progress: 75,
  },
  {
    id: "organic-chemistry",
    title: "Advanced Organic Chemistry",
    description: "Deep dive into complex molecular structures and reactions.",
    image: "https://picsum.photos/600/400?random=2",
    dataAiHint: "science laboratory",
    progress: 40,
  },
  {
    id: "ancient-philosophy",
    title: "History of Ancient Philosophy",
    description: "Explore the thoughts of Socrates, Plato, and Aristotle.",
    image: "https://picsum.photos/600/400?random=3",
    dataAiHint: "history ancient",
    progress: 90,
  },
];

const deadlines = [
  {
    assignment: "Quantum Entanglement Essay",
    course: "Quantum Computing",
    dueDate: "2024-08-15",
    priority: "High",
  },
  {
    assignment: "Benzene Reactions Lab Report",
    course: "Organic Chemistry",
    dueDate: "2024-08-18",
    priority: "High",
  },
  {
    assignment: "Plato's 'Republic' Analysis",
    course: "Ancient Philosophy",
    dueDate: "2024-08-22",
    priority: "Medium",
  },
];

function CourseCard({ course }: { course: (typeof courses)[0] }) {
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
          {course.description}
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
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorHistory, setTutorHistory] = useState<{ type: 'user' | 'ai'; text: string }[]>([
      { type: 'ai', text: "Hello! How can I help you with your studies today?" }
  ]);
  const [tutorLoading, setTutorLoading] = useState(false);

  const [recommendations, setRecommendations] = useState([
    "Module 5: Quantum Algorithms",
    "Review Quiz: Superposition",
    "Supplemental Reading: The Fabric of the Cosmos"
  ]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  const handleAskTutor = async () => {
    if (!tutorQuestion.trim()) return;
    setTutorLoading(true);
    const newHistory = [...tutorHistory, { type: 'user' as const, text: tutorQuestion }];
    setTutorHistory(newHistory);
    setTutorQuestion("");
    try {
      const result = await aiTutoringAssistant({
        question: tutorQuestion,
        courseMaterials: "Vast knowledge of all course materials." // Using dummy data
      });
      setTutorHistory(prev => [...prev, { type: 'ai', text: result.answer }]);
    } catch (error) {
      toast({
        title: "Error Getting Answer",
        description: "There was an error getting an answer from the AI tutor. Please try again.",
        variant: "destructive",
      });
       setTutorHistory(newHistory); // Reset history if AI fails
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
            {courses.map((course) => (
              <CourseCard key={course.title} course={course} />
            ))}
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
                  <TableHead className="text-right">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deadlines.map((deadline) => (
                  <TableRow key={deadline.assignment}>
                    <TableCell className="font-medium">{deadline.assignment}</TableCell>
                    <TableCell className="hidden sm-table-cell">{deadline.course}</TableCell>
                    <TableCell>{deadline.dueDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={deadline.priority === 'High' ? 'destructive' : 'secondary'}>{deadline.priority}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
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
                <CardDescription>Ask a question about your course material.</CardDescription>
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
                 />
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleAskTutor} disabled={tutorLoading}>
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
