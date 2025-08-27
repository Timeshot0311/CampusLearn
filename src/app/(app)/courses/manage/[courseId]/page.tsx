
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourse, updateCourse, Course, Module, Lesson, uploadCourseFile } from "@/services/course-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Trash2, GripVertical, FileText, Youtube, Loader2, Upload } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type NewLessonState = {
    moduleId: string;
    title: string;
    type: Lesson['type'];
    content: string;
};

export default function CourseContentEditor() {
    const params = useParams();
    const courseId = params.courseId as string;
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newModuleName, setNewModuleName] = useState("");
    const [newLesson, setNewLesson] = useState<NewLessonState | null>(null);


    useEffect(() => {
        if (!courseId) return;
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const courseData = await getCourse(courseId);
                if (!courseData) {
                    toast({ title: "Course not found", variant: "destructive" });
                    router.push("/courses/manage");
                    return;
                }
                if (courseData.ownerId !== user.id && user.role !== 'admin' && user.role !== 'lecturer') {
                     toast({ title: "Access Denied", description: "You don't have permission to edit this course.", variant: "destructive"});
                     router.push("/courses/manage");
                     return;
                }
                setCourse(courseData);
            } catch (error) {
                toast({ title: "Error fetching course", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, user, router, toast]);

    const handleAddModule = async () => {
        if (!newModuleName.trim() || !course) return;
        const newModule: Module = {
            id: uuidv4(),
            title: newModuleName,
            lessons: [],
        };
        const updatedModules = [...course.modules, newModule];
        try {
            await updateCourse(courseId, { modules: updatedModules });
            setCourse({ ...course, modules: updatedModules });
            setNewModuleName("");
            toast({ title: "Module Added!" });
        } catch (error) {
            toast({ title: "Error adding module", variant: "destructive" });
        }
    };
    
    const handleAddLesson = async () => {
        if (!newLesson || !course || !newLesson.title.trim() || !newLesson.content.trim()) {
            toast({ title: "Missing fields", description: "Please provide a title and content for the lesson.", variant: "destructive" });
            return;
        };
        
        const { moduleId, ...lessonData } = newLesson;
        const lessonToAdd: Lesson = {
            ...lessonData,
            id: uuidv4(),
            completed: false // default value
        };
        
        const updatedModules = course.modules.map(m => {
            if (m.id === moduleId) {
                return { ...m, lessons: [...m.lessons, lessonToAdd] };
            }
            return m;
        });

        try {
            await updateCourse(courseId, { modules: updatedModules });
            setCourse({ ...course, modules: updatedModules });
            setNewLesson(null);
            toast({ title: "Lesson Added!" });
        } catch (error) {
             toast({ title: "Error adding lesson", variant: "destructive" });
        }
    };
    
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !newLesson) return;
        const file = e.target.files[0];
        if (file && courseId) {
            setUploading(true);
            try {
                const downloadUrl = await uploadCourseFile(courseId, file);
                setNewLesson({ ...newLesson, content: downloadUrl });
                toast({ title: "PDF Uploaded", description: "The file URL has been added to the content field." });
            } catch (error) {
                toast({ title: "Upload Failed", variant: "destructive" });
            } finally {
                setUploading(false);
            }
        }
    };

    if (loading) {
        return <p>Loading course content...</p>;
    }

    if (!course) {
        return <p>Course not found.</p>;
    }
    
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Edit Course Content</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>Manage the modules and lessons for this course.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full space-y-4" defaultValue={course.modules.map(m => m.id)}>
                        {course.modules.map(module => (
                            <AccordionItem value={module.id} key={module.id} className="border rounded-lg px-4">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-5 w-5 text-muted-foreground"/>
                                        {module.title}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-3 pl-8 py-4">
                                        {module.lessons.map((lesson) => (
                                            <li key={lesson.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                                                <div>
                                                    <p className="font-medium">{lesson.title}</p>
                                                    <p className="text-sm text-muted-foreground capitalize">{lesson.type}</p>
                                                </div>
                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </li>
                                        ))}
                                         {module.lessons.length === 0 && <p className="text-sm text-center text-muted-foreground">No lessons in this module yet.</p>}
                                    </ul>
                                    {newLesson?.moduleId === module.id ? (
                                        <div className="p-4 border-t space-y-4">
                                            <h4 className="font-semibold">New Lesson</h4>
                                            <div className="grid gap-2">
                                                <Label>Lesson Title</Label>
                                                <Input placeholder="e.g., The Structure of an Atom" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Lesson Type</Label>
                                                <Select value={newLesson.type} onValueChange={(v: Lesson['type']) => setNewLesson({...newLesson, type: v, content: ''})}>
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
                                                {newLesson.type === 'article' && (
                                                    <Textarea 
                                                        placeholder="Write your article content here. Markdown is supported for headings, lists, bolding, etc." 
                                                        value={newLesson.content} 
                                                        onChange={e => setNewLesson({...newLesson, content: e.target.value})} 
                                                        rows={10}
                                                    />
                                                )}
                                                {newLesson.type === 'youtube' && (
                                                    <Input 
                                                        placeholder="https://www.youtube.com/watch?v=..." 
                                                        value={newLesson.content} 
                                                        onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                                                    />
                                                )}
                                                {newLesson.type === 'pdf' && (
                                                     <div className="flex items-center gap-2">
                                                        <Input 
                                                            placeholder="Upload a PDF file or paste a URL" 
                                                            value={newLesson.content} 
                                                            onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                                                            disabled={uploading}
                                                        />
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
                                                <Button variant="ghost" onClick={() => setNewLesson(null)}>Cancel</Button>
                                                <Button onClick={handleAddLesson}>Save Lesson</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-2 border-t">
                                            <Button variant="link" onClick={() => setNewLesson({ moduleId: module.id, title: '', type: 'article', content: '' })}>
                                                <PlusCircle className="mr-2 h-4 w-4"/> Add Lesson
                                            </Button>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="mt-6 flex gap-2">
                        <Input 
                            placeholder="New Module Name..." 
                            value={newModuleName}
                            onChange={e => setNewModuleName(e.target.value)}
                        />
                        <Button onClick={handleAddModule} disabled={!newModuleName.trim()}>
                             <PlusCircle className="mr-2 h-4 w-4"/> Add Module
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
