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
import { ArrowRight, Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const courses = [
  {
    title: "Introduction to Quantum Computing",
    description: "Learn the fundamentals of quantum mechanics and computation.",
    image: "https://picsum.photos/600/400?random=1",
    dataAiHint: "technology abstract",
    progress: 75,
  },
  {
    title: "Advanced Organic Chemistry",
    description: "Deep dive into complex molecular structures and reactions.",
    image: "https://picsum.photos/600/400?random=2",
    dataAiHint: "science laboratory",
    progress: 40,
  },
  {
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

export function DashboardStudent() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold font-headline mb-4">My Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {courses.map((course) => (
              <Card key={course.title} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold font-headline">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {course.description}
                  </p>
                  <Progress value={course.progress} className="mt-4 animate-progress" style={{animationDelay: `${Math.random() * 0.5}s`}} />
                  <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button size="sm" className="w-full">Continue Learning</Button>
                </CardFooter>
              </Card>
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
                    <TableCell className="hidden sm:table-cell">{deadline.course}</TableCell>
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
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="bg-background p-3 rounded-lg max-w-[85%]">
                            <p className="text-sm">Hello! How can I help you with your studies today?</p>
                        </div>
                    </div>
                </div>
                 <Textarea placeholder="Type your question here..." className="min-h-[80px]" />
            </CardContent>
            <CardFooter>
                <Button className="w-full">Ask AI</Button>
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
            <p className="text-sm text-muted-foreground mb-4">
              Based on your progress in Quantum Computing, we suggest focusing on these areas next:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-sm">
                <li>Module 5: Quantum Algorithms</li>
                <li>Review Quiz: Superposition</li>
                <li>Supplemental Reading: The Fabric of the Cosmos</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Get New Recommendations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
