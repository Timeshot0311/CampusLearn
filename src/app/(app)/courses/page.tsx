
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
import { Course, getCourses } from "@/services/course-service";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function CourseCard({ course }: { course: Course }) {
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
        <Progress value={course.progress} className="mt-4" />
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


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getCourses();
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
  }, [toast]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">My Courses</h1>
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
                <CourseCard key={course.id} course={course} />
            ))
        )}
      </div>
    </div>
  );
}
