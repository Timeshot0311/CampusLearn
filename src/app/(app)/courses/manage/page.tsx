

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { addCourse, deleteCourse, getCourses, updateCourse, Course } from "@/services/course-service";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";


function CourseDialog({ onSave, course, children }: { onSave: (course: Omit<Course, 'id'>) => void; course?: Course | null; children: React.ReactNode }) {
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [instructor, setInstructor] = useState(course?.instructor || "");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const isEditing = !!course;

  const handleSave = () => {
    if (!title || !description || !instructor) {
        toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive"});
        return;
    }
    
    const courseData: Omit<Course, 'id'> = {
        title,
        description,
        instructor,
        progress: course?.progress || 0,
        image: course?.image || `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/600/300`,
        dataAiHint: course?.dataAiHint || "education learning",
        ownerId: course?.ownerId || user.id,
        published: course?.published || false,
        modules: course?.modules || [],
    };

    onSave(courseData);
    setOpen(false);
  };
  
  useEffect(() => {
    if (open) {
      if (course) {
        setTitle(course.title);
        setDescription(course.description);
        setInstructor(course.instructor);
      } else {
        setTitle("");
        setDescription("");
        setInstructor("");
      }
    }
  }, [course, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Course" : "Create New Course"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this course." : "Enter the details for the new course."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to AI" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="e.g. Dr. Alan Turing" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief summary of the course content..." />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Create Course"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


function DeleteCourseAlert({ courseId, onDelete }: { courseId: string, onDelete: (id: string) => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive focus:text-destructive">Delete</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the course and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(courseId)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not an admin or lecturer
  useEffect(() => {
    if (user.role !== 'admin' && user.role !== 'lecturer') {
        toast({ title: "Access Denied", description: "You don't have permission to view this page.", variant: "destructive"});
        router.push('/dashboard');
    }
  }, [user, router, toast]);
  

  const fetchCoursesData = async () => {
    setLoading(true);
    try {
        const courseList = await getCourses();
        setCourses(courseList);
    } catch(error) {
        toast({ title: "Error fetching courses", description: "Could not load course data.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const handleSaveCourse = async (courseData: Omit<Course, 'id'>, existingCourseId?: string) => {
    if (existingCourseId) {
        // Update existing course
        try {
            await updateCourse(existingCourseId, courseData);
            setCourses(courses.map(c => c.id === existingCourseId ? { ...c, ...courseData } : c));
            toast({ title: "Course updated successfully!"});
        } catch (error: any) {
             toast({ title: "Error updating course", description: error.message, variant: "destructive" });
        }
    } else {
        // Add new course
        try {
            const newCourseId = await addCourse(courseData);
            setCourses([...courses, { ...courseData, id: newCourseId }]);
            toast({ title: "Course created successfully!"});
        } catch (error: any) {
            toast({ title: "Error adding course", description: error.message, variant: "destructive" });
        }
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
        await deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
        toast({ title: "Course deleted successfully." });
    } catch (error: any) {
        toast({ title: "Error deleting course", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Course Management</h1>
        <CourseDialog onSave={(courseData) => handleSaveCourse(courseData)}>
             <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Course
            </Button>
        </CourseDialog>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Create, edit, and manage all courses on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <p>Loading courses...</p>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {courses.map((course) => (
                        <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>
                            <Badge variant={course.published ? 'default' : 'secondary'}>{course.published ? "Published" : "Draft"}</Badge>
                        </TableCell>
                         <TableCell>
                           0
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <CourseDialog onSave={(courseData) => handleSaveCourse(courseData, course.id)} course={course}>
                                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">Edit Details</button>
                                    </CourseDialog>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/courses/manage/${course.id}`} className="w-full">Manage Content</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DeleteCourseAlert courseId={course.id} onDelete={handleDeleteCourse} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
