
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Topic, addTopic, getTopics } from "@/services/topic-service";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourses, getStudentCourses, Course } from "@/services/course-service";
import { CreateTopicDialog } from "@/components/create-topic-dialog";


export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const canCreateTopic = user.role === "student" || user.role === "tutor" || user.role === "lecturer";
  const isStudent = user.role === 'student';

  useEffect(() => {
    if (!user?.id) return;

    const fetchTopicsAndCourses = async () => {
        setLoading(true);
        try {
            let fetchedCourses: Course[];
            if (isStudent) {
                fetchedCourses = await getStudentCourses(user.id);
            } else {
                fetchedCourses = await getCourses();
            }
            setCourses(fetchedCourses);

            const allTopics = await getTopics();
            
            // For students, filter topics to only those in their courses or general topics
            if (isStudent) {
                 const studentCourseTitles = new Set(fetchedCourses.map(c => c.title));
                 const filteredTopics = allTopics.filter(topic => 
                    topic.course === "General" || studentCourseTitles.has(topic.course)
                 );
                 setTopics(filteredTopics.sort((a,b) => (b.replies?.[b.replies.length-1]?.timestamp || 0) > (a.replies?.[a.replies.length-1]?.timestamp || 0) ? 1 : -1));
            } else {
                 setTopics(allTopics.sort((a,b) => (b.replies?.[b.replies.length-1]?.timestamp || 0) > (a.replies?.[a.replies.length-1]?.timestamp || 0) ? 1 : -1));
            }

        } catch (error) {
            toast({ title: "Error fetching page data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchTopicsAndCourses();
  }, [toast, user?.id, isStudent]);


  const handleTopicCreated = (newTopic: Topic) => {
    setTopics([{ ...newTopic }, ...topics]);
    toast({ title: "Topic Created!", description: "Your new topic has been posted." });
  };
  
  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">Help Topics</h1>
            {canCreateTopic && (
              <CreateTopicDialog courses={courses} onTopicCreated={handleTopicCreated}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Topic
                </Button>
              </CreateTopicDialog>
            )}
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
            Array.from({length: 3}).map((_, i) => (
                 <Card key={i} className="flex flex-col">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                         <div className="flex items-center gap-2 pt-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-12 w-full mt-2" />
                    </CardHeader>
                     <CardContent className="flex-grow">
                         <Skeleton className="h-6 w-1/3" />
                    </CardContent>
                     <CardFooter className="flex justify-between items-center">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-9 w-1/3" />
                    </CardFooter>
                 </Card>
            ))
        ) : (
            topics.map((topic) => (
            <Card key={topic.id} className="flex flex-col">
                <CardHeader>
                <CardTitle className="font-headline text-lg">{topic.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={topic.authorAvatar} alt={topic.author} />
                        <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{topic.author}</span>
                </div>
                <CardDescription className="pt-2 line-clamp-3">{topic.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <Badge variant="outline">{topic.course}</Badge>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4"/>
                        <span>{topic.replies?.length || 0} Replies</span>
                        <Badge 
                        variant={topic.status === 'Closed' ? 'destructive' : topic.status === 'Reopened' ? 'secondary' : 'default'} 
                        className="capitalize pointer-events-none"
                        >
                        {topic.status}
                        </Badge>
                    </div>
                <Button size="sm" asChild>
                    <Link href={`/topics/${topic.id}`}>View Topic</Link>
                </Button>
                </CardFooter>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}

const Fallback = AvatarFallback;
