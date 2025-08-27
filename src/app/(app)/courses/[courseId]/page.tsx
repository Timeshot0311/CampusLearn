
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckCircle, BookOpen, Youtube, File, ClipboardCheck, GripVertical, Trash2, PlusCircle, Loader2, Upload, Pencil } from "lucide-react";
import { Lesson, Module, Course, getCourse, updateCourse, uploadCourseFile } from "@/services/course-service";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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
            return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
}

const LessonContentDisplay = ({ lesson }: { lesson: Lesson }) => {
    switch (lesson.type) {
        case 'article':
            return <div className="prose dark:prose-invert max-w-none p-6" dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br />') }} />;
        case 'youtube':
            const embedUrl = lesson.content.includes("embed") ? lesson.content : lesson.content.replace("watch?v=", "embed/");
            return (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
                <div className="p-8 flex flex-col items-center justify-center text-center gap-4 aspect-video bg-muted/50 rounded-lg">
                    <FileText className="h-16 w-16 text-muted-foreground"/>
                    <h3 className="text-lg font-semibold">PDF Document: {lesson.title}</h3>
                    <p className="text-muted-foreground">This lesson is a PDF file. Click below to view it in a new tab.</p>
                    <a href={lesson.content} target="_blank" rel="noopener noreferrer">
                        <Button>Download PDF</Button>
                    </a>
                </div>
            );
        default:
            return <div className="p-8 flex items-center justify-center text-center text-muted-foreground aspect-video">Select a lesson to get started.</div>;
    }
};

const LessonDialog = ({ lesson, children }: { lesson: Lesson, children: React.ReactNode }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{lesson.title}</DialogTitle>
                    <DialogDescription className="capitalize">{lesson.type} Lesson</DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-auto">
                    <LessonContentDisplay lesson={lesson} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

const LessonForm = ({ courseId, moduleId, onLessonSaved, onCancel, existingLesson }: { courseId: string, moduleId: string, onLessonSaved: (modules: Module[]) => void, onCancel: () => void, existingLesson?: Lesson }) => {
    const { toast } = useToast();
    const [title, setTitle] = useState(existingLesson?.title || '');
    const [type, setType] = useState<Lesson['type']>(existingLesson?.type || 'article');
    const [content, setContent] = useState(existingLesson?.content || '');
    const [uploading, setUploading] = useState(false);

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        if (file && courseId) {
            setUploading(true);
            try {
                const downloadUrl = await uploadCourseFile(courseId, file);
                setContent(downloadUrl);
                toast({ title: "PDF Uploaded", description: "The file URL has been added to the content field." });
            } catch (error) {
                toast({ title: "Upload Failed", variant: "destructive" });
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSaveLesson = async () => {
        if (!title.trim() || !content.trim()) {
            toast({ title: "Missing fields", description: "Please provide a title and content for the lesson.", variant: "destructive" });
            return;
        }
        
        const currentCourse = await getCourse(courseId);
        if (!currentCourse) return;

        let updatedModules;

        if (existingLesson) {
            // Update existing lesson
            updatedModules = currentCourse.modules.map(m => {
                if (m.id === moduleId) {
                    return { ...m, lessons: m.lessons.map(l => l.id === existingLesson.id ? { ...l, title, type, content } : l) };
                }
                return m;
            });
        } else {
            // Add new lesson
            const newLesson: Lesson = { id: uuidv4(), title, type, content, completed: false };
             updatedModules = currentCourse.modules.map(m => {
                if (m.id === moduleId) {
                    return { ...m, lessons: [...m.lessons, newLesson] };
                }
                return m;
            });
        }


        try {
            await updateCourse(courseId, { modules: updatedModules });
            toast({ title: existingLesson ? "Lesson Updated!" : "Lesson Added!" });
            onLessonSaved(updatedModules);
        } catch (error) {
            toast({ title: "Error saving lesson", variant: "destructive" });
        }
    };
    
    return (
        <div className="p-4 border-t space-y-4">
            <h4 className="font-semibold">{existingLesson ? 'Edit Lesson' : 'New Lesson'}</h4>
            <div className="grid gap-2">
                <Label>Lesson Title</Label>
                <Input placeholder="e.g., The Structure of an Atom" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label>Lesson Type</Label>
                <Select value={type} onValueChange={(v: Lesson['type']) => { setType(v); if (!existingLesson) setContent('')}}>
                    <SelectTrigger><SelectValue placeholder="Lesson Type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="youtube">YouTube Video</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label>Content</Label>
                {type === 'article' && <Textarea placeholder="Write your article content here... Markdown is supported." value={content} onChange={e => setContent(e.target.value)} rows={10}/>}
                {type === 'youtube' && <Input placeholder="https://www.youtube.com/watch?v=..." value={content} onChange={e => setContent(e.target.value)}/>}
                {type === 'pdf' && (
                     <div className="flex items-center gap-2">
                        <Input placeholder="Upload a PDF file or paste a URL" value={content} onChange={e => setContent(e.target.value)} disabled={uploading}/>
                        <Button asChild variant="outline" size="icon">
                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4"/>}
                            </label>
                        </Button>
                        <Input id="pdf-upload" type="file" className="hidden" accept=".pdf" onChange={handlePdfUpload} disabled={uploading}/>
                     </div>
                )}
            </div>
            <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSaveLesson} disabled={uploading}>{existingLesson ? "Save Changes" : "Add Lesson"}</Button>
            </div>
        </div>
    );
};

const EditLessonDialog = ({ courseId, moduleId, onLessonSaved, lesson, children }: { courseId: string, moduleId: string, onLessonSaved: (modules: Module[]) => void, lesson: Lesson, children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    
    const handleLessonSaved = (modules: Module[]) => {
        onLessonSaved(modules);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                 <LessonForm 
                    courseId={courseId} 
                    moduleId={moduleId} 
                    onLessonSaved={handleLessonSaved} 
                    onCancel={() => setOpen(false)} 
                    existingLesson={lesson} 
                 />
            </DialogContent>
        </Dialog>
    )
}


export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [newModuleName, setNewModuleName] = useState("");

  const isLecturerOrAdmin = user?.role === 'lecturer' || user?.role === 'admin';

  useEffect(() => {
    const fetchCourse = async () => {
        try {
            setLoading(true);
            const fetchedCourse = await getCourse(params.courseId);
            setCourse(fetchedCourse);
        } catch (error) {
            toast({ title: "Error fetching course data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchCourse();
  }, [params.courseId, toast]);

  
  const handleAddModule = async () => {
    if (!newModuleName.trim() || !course) return;
    const newModule: Module = { id: uuidv4(), title: newModuleName, lessons: [] };
    const updatedModules = [...course.modules, newModule];
    try {
        await updateCourse(course.id, { modules: updatedModules });
        setCourse({ ...course, modules: updatedModules });
        setNewModuleName("");
        toast({ title: "Module Added!" });
    } catch (error) {
        toast({ title: "Error adding module", variant: "destructive" });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
     if (!course) return;
      const updatedModules = course.modules.filter(m => m.id !== moduleId);
      try {
        await updateCourse(course.id, { modules: updatedModules });
        setCourse({ ...course, modules: updatedModules });
        toast({ title: "Module Deleted!" });
    } catch (error) {
        toast({ title: "Error deleting module", variant: "destructive" });
    }
  }

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!course) return;
     const updatedModules = course.modules.map(m => {
         if (m.id === moduleId) {
             return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
         }
         return m;
     });
     try {
        await updateCourse(course.id, { modules: updatedModules });
        setCourse({ ...course, modules: updatedModules });
        toast({ title: "Lesson Deleted!" });
    } catch (error) {
        toast({ title: "Error deleting lesson", variant: "destructive" });
    }
  }
  
  const onLessonSaved = (updatedModules: Module[]) => {
    if (!course) return;
    setCourse({ ...course, modules: updatedModules });
    setAddingLessonToModule(null);
  }

  if (loading) {
      return (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="w-full h-80" />
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
    <div className="grid md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-2">
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-3xl font-headline">{course.title}</CardTitle>
                    {isLecturerOrAdmin && (
                        <div className="flex items-center gap-2">
                            <Label htmlFor="edit-mode">Edit Mode</Label>
                            <Switch id="edit-mode" checked={editMode} onCheckedChange={setEditMode} />
                        </div>
                    )}
                </div>
                <CardDescription>{course.description}</CardDescription>
            </CardHeader>

            <CardContent>
                <h2 className="text-2xl font-semibold font-headline mb-4">Course Content</h2>
                 <Accordion type="single" collapsible className="w-full" defaultValue={course.modules.length > 0 ? course.modules[0].id : undefined}>
                    {course.modules.map((module) => (
                        <AccordionItem value={module.id} key={module.id}>
                            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-2">
                                    <span>{module.title}</span>
                                     {editMode && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Module?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the "{module.title}" module and all its lessons. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteModule(module.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                     )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-1">
                                    {module.lessons.map((lesson) => (
                                        <li key={lesson.id} className="group flex justify-between items-center pr-2 rounded-md hover:bg-muted/50">
                                            <LessonDialog lesson={lesson}>
                                                <button className="w-full flex items-center justify-between p-3 rounded-md text-left">
                                                    <div className="flex items-center gap-3">
                                                        <LessonIcon type={lesson.type} />
                                                        <span>{lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {lesson.duration && <span className="text-sm text-muted-foreground">{lesson.duration}</span>}
                                                        <CheckCircle className={`h-5 w-5 ${lesson.completed ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                                                    </div>
                                                </button>
                                            </LessonDialog>
                                            {editMode && (
                                                <div className="flex items-center">
                                                    <EditLessonDialog courseId={course.id} moduleId={module.id} onLessonSaved={onLessonSaved} lesson={lesson}>
                                                         <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary/90 hover:bg-primary/10 opacity-0 group-hover:opacity-100"><Pencil className="h-4 w-4" /></Button>
                                                    </EditLessonDialog>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete the "{lesson.title}" lesson.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteLesson(module.id, lesson.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                    {module.lessons.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No lessons in this module yet.</p>}
                                </ul>
                                {editMode && (
                                    addingLessonToModule === module.id ? (
                                        <LessonForm courseId={course.id} moduleId={module.id} onLessonSaved={onLessonSaved} onCancel={() => setAddingLessonToModule(null)} />
                                    ) : (
                                         <div className="p-2 border-t mt-2">
                                            <Button variant="link" onClick={() => setAddingLessonToModule(module.id)}>
                                                <PlusCircle className="mr-2 h-4 w-4"/> Add Lesson
                                            </Button>
                                        </div>
                                    )
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
                {editMode && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-base">Add New Module</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex gap-2">
                                <Input 
                                    placeholder="Enter module name..." 
                                    value={newModuleName}
                                    onChange={e => setNewModuleName(e.target.value)}
                                />
                                <Button onClick={handleAddModule} disabled={!newModuleName.trim()}>
                                     <PlusCircle className="mr-2 h-4 w-4"/> Add Module
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${course.instructor.replace(/\s+/g, '')}`} alt={course.instructor} />
                    <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
