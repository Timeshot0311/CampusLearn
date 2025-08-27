
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckCircle, ClipboardCheck, BookOpen, Youtube, File } from "lucide-react";
import { Lesson, Module } from "@/services/course-service";


const courseData = {
    title: "Introduction to Quantum Computing",
    instructor: "Dr. Evelyn Reed",
    instructorAvatar: "https://i.pravatar.cc/150?u=evelyn",
    description: "This course provides a comprehensive introduction to the principles of quantum computing. We will cover fundamental concepts such as qubits, superposition, and entanglement, and explore key quantum algorithms like Shor's and Grover's. No prior knowledge of quantum mechanics is required, but a strong foundation in linear algebra is recommended.",
    modules: [
        { 
            id: "1",
            title: "Module 1: The Quantum World", 
            lessons: [
                { id: "1", title: "Introduction to Quantum Mechanics", type: "youtube", content: "https://www.youtube.com/embed/I2G6_p0d2y8", completed: true },
                { id: "2", title: "Qubits vs. Classical Bits", type: "video", content: "", duration: "15:52", completed: true },
                { id: "3", title: "Reading: The Quantum Revolution", type: "article", content: "## The Quantum Leap...\n\nQuantum mechanics represents a fundamental shift in our understanding of the physical world. Unlike classical mechanics, which describes the motion of macroscopic objects, quantum mechanics deals with the behavior of matter and light on the atomic and subatomic scales.", completed: true },
            ]
        },
        { 
            id: "2",
            title: "Module 2: Superposition and Entanglement", 
            lessons: [
                { id: "4", title: "Understanding Superposition", type: "video", content: "", duration: "18:21", completed: true },
                { id: "5", title: "Spooky Action at a Distance: Entanglement", type: "video", content: "", duration: "22:05", completed: false },
                { id: "6", title: "Quiz: Module 2 Concepts", type: "quiz", content: "", duration: "10 questions", completed: false },
                 { id: "7", title: "Key Research Paper", type: "pdf", content: "https://example.com/quantum_paper.pdf", completed: false },
            ]
        },
    ]
};


const LessonIcon = ({ type }: { type: Lesson['type'] }) => {
    switch (type) {
        case "video":
            return <PlayCircle className="h-5 w-5 text-muted-foreground" />;
        case "article":
            return <BookOpen className="h-5 w-5 text-muted-foreground" />;
        case "quiz":
            return <ClipboardCheck className="h-5 w-5 text-muted-foreground" />;
        case "youtube":
            return <Youtube className="h-5 w-5 text-muted-foreground" />;
        case "pdf":
            return <File className="h-5 w-5 text-muted-foreground" />;
        default:
            return null;
    }
}

const LessonContentDisplay = ({ lesson }: { lesson: Lesson }) => {
    switch (lesson.type) {
        case 'article':
            // In a real app, you'd use a markdown renderer library
            return <div className="prose dark:prose-invert max-w-none p-4" dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }} />;
        case 'youtube':
            return (
                <div className="aspect-video">
                    <iframe
                        className="w-full h-full"
                        src={lesson.content}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );
        case 'pdf':
            return (
                <div className="p-4">
                    <a href={lesson.content} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary underline">
                        <FileText className="h-5 w-5"/>
                        View PDF: {lesson.title}
                    </a>
                </div>
            );
        default:
            return <p className="p-4 text-muted-foreground">Content for this lesson type is not yet available.</p>;
    }
};

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(courseData.modules[0].lessons[0]);

  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="overflow-hidden">
            {activeLesson ? (
                <LessonContentDisplay lesson={activeLesson} />
            ) : (
                <div className="p-8 text-center text-muted-foreground">Select a lesson to begin.</div>
            )}
            
            <CardHeader>
                <CardTitle className="text-3xl font-headline">{activeLesson?.title || courseData.title}</CardTitle>
                {activeLesson ? null : <CardDescription>{courseData.description}</CardDescription> }
            </CardHeader>
            <CardContent>
                <h2 className="text-2xl font-semibold font-headline mb-4">Course Content</h2>
                 <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {courseData.modules.map((module, index) => (
                        <AccordionItem value={`item-${index}`} key={module.id}>
                            <AccordionTrigger className="text-lg font-semibold">{module.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-1">
                                    {module.lessons.map((lesson) => (
                                        <li key={lesson.id}>
                                            <button 
                                                onClick={() => handleLessonClick(lesson)}
                                                className={`w-full flex items-center justify-between p-3 rounded-md text-left ${activeLesson?.id === lesson.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <LessonIcon type={lesson.type} />
                                                    <span>{lesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {lesson.duration && <span className="text-sm text-muted-foreground">{lesson.duration}</span>}
                                                    <CheckCircle className={`h-5 w-5 ${lesson.completed ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                                                </div>
                                            </button>
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
