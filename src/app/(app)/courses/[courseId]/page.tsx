
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckCircle } from "lucide-react";


const courseData = {
    title: "Introduction to Quantum Computing",
    instructor: "Dr. Evelyn Reed",
    instructorAvatar: "https://i.pravatar.cc/150?u=evelyn",
    description: "This course provides a comprehensive introduction to the principles of quantum computing. We will cover fundamental concepts such as qubits, superposition, and entanglement, and explore key quantum algorithms like Shor's and Grover's. No prior knowledge of quantum mechanics is required, but a strong foundation in linear algebra is recommended.",
    modules: [
        { 
            title: "Module 1: The Quantum World", 
            lessons: [
                { title: "Introduction to Quantum Mechanics", type: "video", duration: "12:34", completed: true },
                { title: "Qubits vs. Classical Bits", type: "video", duration: "15:52", completed: true },
                { title: "Reading: The Quantum Revolution", type: "reading", duration: "20 min", completed: true },
            ]
        },
        { 
            title: "Module 2: Superposition and Entanglement", 
            lessons: [
                { title: "Understanding Superposition", type: "video", duration: "18:21", completed: true },
                { title: "Spooky Action at a Distance: Entanglement", type: "video", duration: "22:05", completed: false },
                { title: "Quiz: Module 2 Concepts", type: "quiz", duration: "10 questions", completed: false },
            ]
        },
        { 
            title: "Module 3: Quantum Algorithms", 
            lessons: [
                { title: "Shor's Algorithm Explained", type: "video", duration: "25:10", completed: false },
                { title: "Grover's Search Algorithm", type: "video", duration: "19:45", completed: false },
                { title: "Practical Applications", type: "reading", duration: "15 min", completed: false },
            ]
        }
    ]
};


const LessonIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "video":
            return <PlayCircle className="h-5 w-5 text-muted-foreground" />;
        case "reading":
            return <FileText className="h-5 w-5 text-muted-foreground" />;
        case "quiz":
            return <ClipboardCheck className="h-5 w-5 text-muted-foreground" />;
        default:
            return null;
    }
}

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">{courseData.title}</CardTitle>
                <CardDescription>{courseData.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <h2 className="text-2xl font-semibold font-headline mb-4">Course Content</h2>
                 <Accordion type="single" collapsible className="w-full">
                    {courseData.modules.map((module, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold">{module.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-3">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <li key={lessonIndex} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <LessonIcon type={lesson.type} />
                                                <span>{lesson.title}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                                                <CheckCircle className={`h-5 w-5 ${lesson.completed ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            </CardContent>
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={courseData.instructorAvatar} alt={courseData.instructor} />
                    <AvatarFallback>{courseData.instructor.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline">{courseData.instructor}</CardTitle>
                <CardDescription>Lead Instructor</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full">Ask a Question</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
