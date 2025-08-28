
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
import Link from "next/link";
import { useEffect, useState } from "react";
import { Course, getCourses, addCourse, getStudentCourses } from "@/services/course-service";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
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
import { MessageSquarePlus, PlusCircle, Users } from "lucide-react";
import { CreateTopicDialog } from "@/components/create-topic-dialog";
import { Topic } from "@/services/topic-service";


function CourseDialog({ onSave }: { onSave: (course: Omit<Course, 'id' | 'modules' | 'progress' | 'published'>) => void; }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSave = () => {
    if (!title || !description) {
        toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive"});
        return;
    }
    
    const courseData: Omit<Course, 'id' | 'modules' | 'progress'| 'published'> = {
        title,
        description,
        instructor: user!.name,
        image: `https://picsum.photos/seed/${title.replace(/\s+/g, '')}/600/300`,
        dataAiHint: "education learning",
        ownerId: user!.id,
        enrolledStudents: [],
    };

    onSave(courseData);
    setOpen(false);
  };
  
  useEffect(() => {
    if (!open) {
        setTitle("");
        setDescription("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
        </Button>
    </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Enter the details for the new course. You can add content after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to AI" />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief summary of the course content..." />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave}>Create Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


function CourseCard({ course, onTopicCreated }: { course: Course; onTopicCreated: (newTopic: Topic) => void; }) {
  const { user } = useAuth();
  const isTutorOrLecturer = user.role === 'tutor' || user.role === 'lecturer';

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
        <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Users className="h-4 w-4 mr-2" />
            <span>{course.enrolledStudents?.length || 0} Students</span>
        </div>
        <Progress value={course.progress} className="mt-4" />
        <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button size="sm" className="w-full" asChild>
            <Link href={`/courses/${course.id}`}>
              {course.progress > 0 ? "Continue Learning" : "Start Course"}
            </Link>
        </Button>
        {isTutorOrLecturer && (
          <CreateTopicDialog
            courses={[course]}
            defaultCourseId={course.id}
            onTopicCreated={onTopicCreated}
          >
             <Button size="sm" variant="outline">
                <MessageSquarePlus className="h-4 w-4" />
             </Button>
          </CreateTopicDialog>
        )}
      </CardFooter>
    </Card>
  );
}


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const isLecturerOrAdmin = user?.role === 'lecturer' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    if (!user?.id) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        let fetchedCourses;
        if (isStudent) {
            fetchedCourses = await getStudentCourses(user.id);
        } else {
            fetchedCourses = await getCourses();
        }
        setCourses(fetchedCourses);
      } catch (error) {
        toast({
          title: "Error Fetching Courses",
          description: "Could not load course data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [toast, user?.id, isStudent]);
  
  const handleCreateCourse = async (courseData: Omit<Course, 'id' | 'modules' | 'progress'| 'published'>) => {
    try {
        const courseToAdd: Omit<Course, 'id'> = {
            ...courseData,
            modules: [],
            progress: 0,
            published: false,
        };
        const newCourseId = await addCourse(courseToAdd);
        setCourses([...courses, { ...courseToAdd, id: newCourseId }]);
        toast({ title: "Course created successfully!"});
    } catch (error: any) {
        toast({ title: "Error creating course", description: error.message, variant: "destructive" });
    }
  };
  
  const handleTopicCreated = (newTopic: Topic) => {
    // This is mainly to update UI if needed on this page, though topics page is separate
    toast({ title: "Topic Created!", description: `"${newTopic.title}" has been posted.` });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Courses</h1>
        {isLecturerOrAdmin && <CourseDialog onSave={handleCreateCourse} />}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                    <Skeleton className="w-full h-[180px]" />
                    <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-9 w-full" />
                    </CardFooter>
                </Card>
            ))
        ) : (
            courses.map((course) => (
                <CourseCard key={course.id} course={course} onTopicCreated={handleTopicCreated}/>
            ))
        )}
      </div>
    </div>
  );
}
