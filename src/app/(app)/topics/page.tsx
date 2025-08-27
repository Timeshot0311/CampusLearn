
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Topic, addTopic, getTopics } from "@/services/topic-service";
import { Skeleton } from "@/components/ui/skeleton";


function CreateTopicDialog({ onSave }: { onSave: (topic: Omit<Topic, 'id'| 'author'| 'authorAvatar'|'replies'|'status'|'materials'>) => void }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [course, setCourse] = useState("");
    const { toast } = useToast();

    const handleSave = () => {
        if (!title || !description || !course) {
            toast({ title: "Missing Fields", description: "Please fill out all fields to create a topic.", variant: "destructive" });
            return;
        }
        onSave({ title, description, course });
        setOpen(false);
        setTitle("");
        setDescription("");
        setCourse("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Topic
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Help Topic</DialogTitle>
                    <DialogDescription>
                        Describe the subject you need help with. A tutor or lecturer will respond soon.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Topic Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., 'Help with Photosynthesis'" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="course">Related Course</Label>
                        <Input id="course" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g., 'Biology 101'" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your question in detail..." rows={5} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Create Topic</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const isStudent = user.role === "student";

  useEffect(() => {
    const fetchTopics = async () => {
        try {
            const fetchedTopics = await getTopics();
            setTopics(fetchedTopics);
        } catch (error) {
            toast({ title: "Error fetching topics", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchTopics();
  }, [toast]);


  const handleCreateTopic = async (newTopicData: Omit<Topic, 'id' | 'author' | 'authorAvatar' | 'replies' | 'status' | 'materials'>) => {
    try {
        const topicToAdd: Omit<Topic, 'id'> = {
            ...newTopicData,
            author: user.name,
            authorAvatar: user.avatar,
            replies: [],
            status: "Open",
            materials: []
        };
        const newTopicId = await addTopic(topicToAdd);
        setTopics([{ ...topicToAdd, id: newTopicId }, ...topics]);
        toast({ title: "Topic Created!", description: "Your request for help has been posted." });
    } catch (error) {
        toast({ title: "Error creating topic", variant: "destructive" });
    }
  };
  
  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">Help Topics</h1>
            {isStudent && <CreateTopicDialog onSave={handleCreateTopic} />}
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
