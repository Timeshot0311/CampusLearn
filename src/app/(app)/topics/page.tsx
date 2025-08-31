

"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, MessageSquare, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Topic, addTopic, getTopics, deleteTopic, TopicStatus, updateTopic } from "@/services/topic-service";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourses, getStudentCourses, Course } from "@/services/course-service";
import { CreateTopicDialog } from "@/components/create-topic-dialog";
import { UserProfileHoverCard } from "@/components/user-profile-hover-card";
import { User } from "@/services/user-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


function TopicCard({ topic, onTopicDeleted, onStatusChanged, isModerator }: { topic: Topic; onTopicDeleted: (id: string) => void; onStatusChanged: (id: string, status: TopicStatus) => void; isModerator: boolean; }) {
    const topicAuthor = { 
        id: topic.authorId, 
        name: topic.author, 
        avatar: topic.authorAvatar 
    } as User;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-lg">{topic.title}</CardTitle>
                    {isModerator && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the topic "{topic.title}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onTopicDeleted(topic.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete Topic
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <UserProfileHoverCard user={topicAuthor}>
                         <Link href={`/profile/${topic.authorId}`}>
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={topic.authorAvatar} alt={topic.author} />
                                <AvatarFallback>{topic.author?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                        </Link>
                    </UserProfileHoverCard>
                    <UserProfileHoverCard user={topicAuthor}>
                        <Link href={`/profile/${topic.authorId}`} className="hover:underline">{topic.author}</Link>
                    </UserProfileHoverCard>
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
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={!isModerator}>
                            <Badge 
                                variant={topic.status === 'Closed' ? 'destructive' : topic.status === 'Reopened' ? 'secondary' : 'default'} 
                                className={cn("capitalize", isModerator && "cursor-pointer hover:opacity-80")}
                            >
                                {topic.status}
                            </Badge>
                        </DropdownMenuTrigger>
                         {isModerator && (
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => onStatusChanged(topic.id, "Open")}>Mark as Open</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChanged(topic.id, "Reopened")}>Mark as Reopened</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChanged(topic.id, "Closed")}>Mark as Closed</DropdownMenuItem>
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                </div>
                <Button size="sm" asChild>
                    <Link href={`/topics/${topic.id}`}>View Topic</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function TopicsPage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<TopicStatus | "All">("All");

  const canCreateTopic = user.role === "student" || user.role === "tutor" || user.role === "lecturer";
  const isStudent = user.role === 'student';
  const isModerator = user.role === "tutor" || user.role === "lecturer" || user.role === "admin";

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
            
            if (isStudent) {
                 const studentCourseTitles = new Set(fetchedCourses.map(c => c.title));
                 const filteredTopics = allTopics.filter(topic => 
                    topic.course === "General" || studentCourseTitles.has(topic.course)
                 );
                 setAllTopics(filteredTopics.sort((a,b) => (b.replies?.[b.replies.length-1]?.timestamp || 0) > (a.replies?.[a.replies.length-1]?.timestamp || 0) ? 1 : -1));
            } else {
                 setAllTopics(allTopics.sort((a,b) => (b.replies?.[b.replies.length-1]?.timestamp || 0) > (a.replies?.[a.replies.length-1]?.timestamp || 0) ? 1 : -1));
            }

        } catch (error) {
            toast({ title: "Error fetching page data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchTopicsAndCourses();
  }, [toast, user?.id, user.role, isStudent]);
  
  const filteredTopics = useMemo(() => {
      if (statusFilter === "All") return allTopics;
      return allTopics.filter(topic => topic.status === statusFilter);
  }, [allTopics, statusFilter]);


  const handleTopicCreated = (newTopic: Topic) => {
    setAllTopics([{ ...newTopic }, ...allTopics]);
    toast({ title: "Topic Created!", description: "Your new topic has been posted." });
  };
  
  const handleTopicDeleted = async (topicId: string) => {
    try {
        await deleteTopic(topicId);
        setAllTopics(allTopics.filter(t => t.id !== topicId));
        toast({ title: "Topic Deleted", description: "The topic has been permanently removed."});
    } catch (error) {
        toast({ title: "Error Deleting Topic", variant: "destructive"});
    }
  };

  const handleStatusChanged = async (topicId: string, status: TopicStatus) => {
    try {
        await updateTopic(topicId, { status });
        setAllTopics(allTopics.map(t => t.id === topicId ? { ...t, status } : t));
        toast({ title: "Status Updated", description: `Topic marked as ${status}.`});
    } catch (error) {
        toast({ title: "Error updating status", variant: "destructive"});
    }
  }
  
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

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
        <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Open">Open</TabsTrigger>
            <TabsTrigger value="Closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>


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
            filteredTopics.map((topic) => (
                <TopicCard 
                    key={topic.id} 
                    topic={topic} 
                    onTopicDeleted={handleTopicDeleted} 
                    onStatusChanged={handleStatusChanged}
                    isModerator={isModerator}
                />
            ))
        )}
      </div>
    </div>
  );
}

const Fallback = AvatarFallback;


