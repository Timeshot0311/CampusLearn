
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckCircle, BookOpen, Youtube, File, ClipboardCheck } from "lucide-react";
import { Lesson, Module, Course, getCourse } from "@/services/course-service";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";


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
            // In a real app, you'd use a markdown renderer library like 'react-markdown'
            return <div className="prose dark:prose-invert max-w-none p-4" dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }} />;
        case 'youtube':
            // Basic URL to embed URL conversion
            const embedUrl = lesson.content.replace("watch?v=", "embed/");
            return (
                <div className="aspect-video">
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            );
        case 'pdf':
            return (
                <div className="p-4 flex flex-col items-center justify-center text-center gap-4 aspect-video bg-muted/50">
                    <FileText className="h-16 w-16 text-muted-foreground"/>
                    <h3 className="text-lg font-semibold">PDF Document</h3>
                    <p className="text-muted-foreground">This lesson is a PDF file.</p>
                    <a href={lesson.content} target="_blank" rel="noopener noreferrer">
                        <Button>Download PDF</Button>
                    </a>
                </div>
            );
        default:
            return <p className="p-4 text-muted-foreground">Content for this lesson type is not yet available.</p>;
    }
};

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
        try {
            setLoading(true);
            const fetchedCourse = await getCourse(params.courseId);
            setCourse(fetchedCourse);
            if (fetchedCourse?.modules?.[0]?.lessons?.[0]) {
                setActiveLesson(fetchedCourse.modules[0].lessons[0]);
            }
        } catch (error) {
            toast({ title: "Error fetching course data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchCourse();
  }, [params.courseId, toast]);


  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  if (loading) {
      return (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="w-full aspect-video" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-6 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )
  }
  
  if (!course) {
      return <p>Course not found.</p>
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="overflow-hidden">
            {activeLesson ? (
                <LessonContentDisplay lesson={activeLesson} />
            ) : (
                <div className="p-8 text-center text-muted-foreground aspect-video flex items-center justify-center">Select a lesson to begin.</div>
            )}
            
            <CardHeader>
                <CardTitle className="text-3xl font-headline">{activeLesson?.title || course.title}</CardTitle>
                {activeLesson ? null : <CardDescription>{course.description}</CardDescription> }
            </CardHeader>
            <CardContent>
                <h2 className="text-2xl font-semibold font-headline mb-4">Course Content</h2>
                 <Accordion type="single" collapsible className="w-full" defaultValue={course.modules.length > 0 ? course.modules[0].id : undefined}>
                    {course.modules.map((module, index) => (
                        <AccordionItem value={module.id} key={module.id}>
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
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${course.instructor.replace(/\s+/g, '')}`} alt={course.instructor} />
                    <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline">{course.instructor}</CardTitle>
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
