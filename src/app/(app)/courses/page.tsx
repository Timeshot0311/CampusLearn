
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

const courses = [
  {
    id: "quantum-computing",
    title: "Introduction to Quantum Computing",
    description: "Learn the fundamentals of quantum mechanics and computation.",
    image: "https://picsum.photos/600/400?random=1",
    dataAiHint: "technology abstract",
    progress: 75,
    instructor: "Dr. Evelyn Reed",
  },
  {
    id: "organic-chemistry",
    title: "Advanced Organic Chemistry",
    description: "Deep dive into complex molecular structures and reactions.",
    image: "https://picsum.photos/600/400?random=2",
    dataAiHint: "science laboratory",
    progress: 40,
    instructor: "Dr. Evelyn Reed",
  },
  {
    id: "ancient-philosophy",
    title: "History of Ancient Philosophy",
    description: "Explore the thoughts of Socrates, Plato, and Aristotle.",
    image: "https://picsum.photos/600/400?random=3",
    dataAiHint: "history ancient",
    progress: 90,
    instructor: "Dr. Evelyn Reed",
  },
    {
    id: "financial-system",
    title: "The Modern Financial System",
    description: "Understand the institutions and forces that shape our economy.",
    image: "https://picsum.photos/600/400?random=4",
    dataAiHint: "finance economy",
    progress: 25,
    instructor: "Dr. Samuel Green",
  },
];

function CourseCard({ course }: { course: (typeof courses)[0] }) {
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
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">My Courses</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
            <CourseCard key={course.title} course={course} />
        ))}
      </div>
    </div>
  );
}
