
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckCircle, BookOpen, Youtube, File, ClipboardCheck, Trash2, PlusCircle, Loader2, Upload, Pencil, Users, Send, UserPlus } from "lucide-react";
import { Course, Module, Lesson, updateCourse, uploadCourseFile, getCourse } from "@/services/course-service";
import { Topic, addTopic } from "@/services/topic-service";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, getUsers, updateUser } from "@/services/user-service";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EnrollStudentDialog } from "@/components/enroll-student-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


const LessonIcon = ({ type }: { type: Lesson['type'] }) => {
    switch (type) {
        case "video":
            return <PlayCircle className="h-5 w-5 text-primary" />;
        case "article":
            return <BookOpen className="h-5 w-5 text-blue-500" />;
        case "quiz":
            return <ClipboardCheck className="h-5 w-5 text-amber-500" />;
        case "youtube":
            return <Youtube className="h-5 w-5 text-red-500" />;
        case "pdf":
            return <File className="h-5 w-5 text-red-700" />;
        default:
            return <FileText className="h-5 w-5 text-gray-500" />;
    }
}

const LessonContentDisplay = ({ lesson, courseTitle }: { lesson: Lesson | null; courseTitle: string }) => {
    if (!lesson) {
        return (
            <Card className="h-full">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                    <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Welcome to {courseTitle}!</h3>
                    <p className="text-muted-foreground">Select a lesson from the list on the left to get started.</p>
                </CardContent>
            </Card>
        );
    }

    const renderContent = () => {
         switch (lesson.type) {
            case 'article':
                return <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none p-6">{lesson.content}</ReactMarkdown>;
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
    }

    return (
        <Card className="flex-grow">
            <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription className="capitalize">{lesson.type} lesson</CardDescription>
            </CardHeader>
            <CardContent>
               {renderContent()}
            </CardContent>
        </Card>
    )
};

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
};

const AssignStaffDialog = ({ course, onStaffAssigned, children, allUsers }: { course: Course, onStaffAssigned: (course: Course) => void, children: React.ReactNode, allUsers: User[]}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [lecturers, setLecturers] = useState<MultiSelectOption[]>([]);
    const [tutors, setTutors] = useState<MultiSelectOption[]>([]);
    const [assignedLecturers, setAssignedLecturers] = useState<string[]>([]);
    const [assignedTutors, setAssignedTutors] = useState<string[]>([]);
    
    const isAdmin = user?.role === 'admin';
    const isLecturer = user?.role === 'lecturer';

    useEffect(() => {
        if (open) {
            setLecturers(allUsers.filter(u => u.role === 'lecturer').map(u => ({ value: u.id, label: u.name })));
            setTutors(allUsers.filter(u => u.role === 'tutor').map(u => ({ value: u.id, label: u.name })));
            setAssignedLecturers(course.assignedLecturers || []);
            setAssignedTutors(course.assignedTutors || []);
        }
    }, [open, course, allUsers]);

    const handleSave = async () => {
        try {
            // Update course document
            const updatedCourseData = { assignedLecturers, assignedTutors };
            await updateCourse(course.id, updatedCourseData);

            // Determine changes in staff
            const originalLecturers = new Set(course.assignedLecturers || []);
            const newLecturers = new Set(assignedLecturers);
            const originalTutors = new Set(course.assignedTutors || []);
            const newTutors = new Set(assignedTutors);

            const allOriginalStaffIds = new Set([...originalLecturers, ...originalTutors]);
            const allNewStaffIds = new Set([...newLecturers, ...newTutors]);

            const staffToUpdate = new Set([...allOriginalStaffIds, ...allNewStaffIds]);

            // Update user documents for all affected staff
            for (const userId of staffToUpdate) {
                const staffUser = allUsers.find(u => u.id === userId);
                if (staffUser) {
                    let userAssignedCourses = new Set(staffUser.assignedCourses || []);
                    
                    if(allNewStaffIds.has(userId)) {
                        userAssignedCourses.add(course.id);
                    } else {
                        userAssignedCourses.delete(course.id);
                    }
                    
                    await updateUser(userId, { assignedCourses: Array.from(userAssignedCourses) });
                }
            }
            
            toast({ title: "Staff Assigned!" });
            onStaffAssigned({ ...course, ...updatedCourseData });
            setOpen(false);
        } catch (error) {
            toast({ title: "Error assigning staff", variant: "destructive" });
        }
    }

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Staff to "{course.title}"</DialogTitle>
                    <DialogDescription>Select the lecturers and tutors responsible for this course.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Lecturers</Label>
                        <MultiSelect 
                            options={lecturers}
                            selected={assignedLecturers}
                            onChange={setAssignedLecturers}
                            placeholder="Assign lecturers..."
                            disabled={!isAdmin}
                        />
                         {!isAdmin && isLecturer && <p className="text-xs text-muted-foreground">Only admins can assign lecturers.</p>}
                    </div>
                     <div className="grid gap-2">
                        <Label>Tutors</Label>
                         <MultiSelect 
                            options={tutors}
                            selected={assignedTutors}
                            onChange={setAssignedTutors}
                            placeholder="Assign tutors..."
                            disabled={!isAdmin && !isLecturer}
                        />
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save Assignments</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const CourseStaff = ({ course, allUsers }: { course: Course, allUsers: User[] }) => {
    const staff = [
        ...(course.assignedLecturers?.map(id => allUsers.find(u => u.id === id)) || []),
        ...(course.assignedTutors?.map(id => allUsers.find(u => u.id === id)) || [])
    ].filter((u): u is User => !!u);

    if (staff.length === 0) return <p className="text-sm text-muted-foreground">No staff assigned.</p>;

    return (
         <div className="flex items-center -space-x-2">
            {staff.map(user => (
                <TooltipProvider key={user.id}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 border-2 border-background">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{user.name} <span className="text-muted-foreground capitalize">({user.role})</span></p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </div>
    )
}

const AskQuestionCard = ({ course, user }: { course: Course, user: User }) => {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleAskQuestion = async () => {
        if (!question.trim()) return;
        setLoading(true);

        const newTopicData: Omit<Topic, 'id'> = {
            title: `Question about ${course.title}`,
            description: question,
            course: course.title,
            author: user.name,
            authorId: user.id,
            authorAvatar: user.avatar,
            replies: [],
            status: "Open",
            materials: []
        };
        
        try {
            await addTopic(newTopicData);
            toast({
                title: "Question Submitted!",
                description: "A new help topic has been created. A tutor or lecturer will respond soon."
            });
            setQuestion("");
        } catch (error) {
            toast({ title: "Error submitting question", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
                <CardDescription>Need help? Ask a tutor or lecturer a question about this course.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    placeholder="Type your question here..."
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    rows={4}
                />
            </CardContent>
            <CardFooter>
                 <Button onClick={handleAskQuestion} disabled={loading || !question.trim()} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Submitting..." : "Submit Question"}
                    {!loading && <Send className="ml-2 h-4 w-4" />}
                </Button>
            </CardFooter>
        </Card>
    );
};

const CourseParticipants = ({ course, allUsers }: { course: Course, allUsers: User[] }) => {
    const participants = useMemo(() => {
        const studentIds = new Set(course.enrolledStudents || []);
        const lecturerIds = new Set(course.assignedLecturers || []);
        const tutorIds = new Set(course.assignedTutors || []);

        return allUsers.filter(user => 
            studentIds.has(user.id) || 
            lecturerIds.has(user.id) || 
            tutorIds.has(user.id)
        );
    }, [course, allUsers]);

    if (participants.length === 0) {
        return null; // Or some placeholder
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Course Participants</CardTitle>
                <CardDescription>All students and staff involved in this course.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                     <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function CourseDetailClient({ courseId }: { courseId: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [newModuleName, setNewModuleName] = useState("");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const isLecturerOrAdmin = user?.role === 'lecturer' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const fetchCourseAndUsers = async () => {
      try {
          // setLoading(true); // Optional: manage loading state more granularly
          const [fetchedCourse, fetchedUsers] = await Promise.all([
              getCourse(courseId),
              getUsers()
          ]);
          setCourse(fetchedCourse);
          setAllUsers(fetchedUsers);
      } catch (error) {
          toast({ title: "Error fetching course data", variant: "destructive" });
      } finally {
          setLoading(false); // Ensure loading is false after fetching
      }
  };

  useEffect(() => {
    setLoading(true);
    fetchCourseAndUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, toast]);

  
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
        if(activeLesson?.id === lessonId) setActiveLesson(null);
        setCourse({ ...course, modules: updatedModules });
        toast({ title: "Lesson Deleted!" });
    } catch (error) {
        toast({ title: "Error deleting lesson", variant: "destructive" });
    }
  }
  
  const onModuleDataSaved = (updatedModules: Module[]) => {
    if (!course) return;
    setCourse({ ...course, modules: updatedModules });
    setAddingLessonToModule(null);
  }

   const onCourseDataSaved = (updatedCourse: Course) => {
    if (!course) return;
    setCourse(updatedCourse);
    fetchCourseAndUsers(); // Re-fetch to get updated user data if staff changed
  }

  if (loading) {
      return (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-[80vh] w-full" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="w-full h-[80vh]" />
          </div>
        </div>
      )
  }
  
  if (!course) {
      return <p>Course not found.</p>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full">
        {/* Left column for course curriculum */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline">{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                        </div>
                         {isLecturerOrAdmin && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Label htmlFor="edit-mode" className="text-sm">Edit</Label>
                                <Switch id="edit-mode" checked={editMode} onCheckedChange={setEditMode} />
                            </div>
                        )}
                    </div>
                     <div className="flex justify-between items-center pt-4">
                        <CourseStaff course={course} allUsers={allUsers} />
                        {editMode && isLecturerOrAdmin && (
                            <div className="flex items-center gap-2">
                                <AssignStaffDialog course={course} onStaffAssigned={onCourseDataSaved} allUsers={allUsers}>
                                    <Button variant="outline" size="sm"><Users className="mr-2 h-4 w-4"/>Assign Staff</Button>
                                </AssignStaffDialog>
                                <EnrollStudentDialog allUsers={allUsers} allCourses={[course]} onEnrollmentChanged={fetchCourseAndUsers} course={course}>
                                    <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4"/>Enroll</Button>
                                </EnrollStudentDialog>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full" defaultValue={course.modules.length > 0 ? course.modules[0].id : undefined}>
                        {course.modules.map((module) => (
                             <AccordionItem value={module.id} key={module.id}>
                                <div className="flex items-center w-full">
                                    <AccordionTrigger className="text-lg font-semibold hover:no-underline flex-grow">
                                        <span>{module.title}</span>
                                    </AccordionTrigger>
                                     {editMode && isLecturerOrAdmin && (
                                        <div className="flex items-center pl-2">
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Module?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the "{module.title}" module and all its lessons.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteModule(module.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </div>
                                <AccordionContent>
                                    <ul className="space-y-1">
                                        {module.lessons.map((lesson) => (
                                            <li key={lesson.id} className={`group flex justify-between items-center pr-2 rounded-md hover:bg-muted/50 cursor-pointer ${activeLesson?.id === lesson.id ? 'bg-muted' : ''}`} onClick={() => setActiveLesson(lesson)}>
                                                <div className="flex items-center gap-3 p-3">
                                                    <LessonIcon type={lesson.type} />
                                                    <span>{lesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className={`h-5 w-5 ${lesson.completed ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                                                    {editMode && isLecturerOrAdmin && (
                                                        <div className="flex items-center opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                            <EditLessonDialog courseId={course.id} moduleId={module.id} onLessonSaved={onModuleDataSaved} lesson={lesson}>
                                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary/90 hover:bg-primary/10"><Pencil className="h-4 w-4" /></Button>
                                                            </EditLessonDialog>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                                                                        <AlertDialogDescription>This will permanently delete the "{lesson.title}" lesson.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeleteLesson(module.id, lesson.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                        {module.lessons.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No lessons in this module yet.</p>}
                                    </ul>
                                    {editMode && isLecturerOrAdmin && (
                                        addingLessonToModule === module.id ? (
                                            <LessonForm courseId={course.id} moduleId={module.id} onLessonSaved={onModuleDataSaved} onCancel={() => setAddingLessonToModule(null)} />
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
                </CardContent>
            </Card>

            {editMode && isLecturerOrAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Add New Module</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input placeholder="Enter module name..." value={newModuleName} onChange={e => setNewModuleName(e.target.value)} />
                            <Button onClick={handleAddModule} disabled={!newModuleName.trim()}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Module
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isStudent && user && (
                 <AskQuestionCard course={course} user={user} />
            )}
        </div>

        {/* Right column for lesson content */}
        <div className="lg:col-span-2">
            <LessonContentDisplay lesson={activeLesson} courseTitle={course.title} />
            <CourseParticipants course={course} allUsers={allUsers} />
        </div>
    </div>
  );
}

    