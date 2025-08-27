

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

type TopicStatus = "Open" | "Closed" | "Reopened";

type Topic = {
  id: string;
  title: string;
  description: string;
  course: string;
  author: string;
  authorAvatar: string;
  replies: any[]; 
  status: TopicStatus;
  materials: any[];
};

const initialTopics: Topic[] = [
  { id: "1", title: "Confused about Quantum Tunneling", description: "Can someone explain the probability calculation for a particle to tunnel through a barrier? I'm not getting it.", course: "Quantum Computing", author: "Alex Doe", authorAvatar: "https://i.pravatar.cc/150?u=alex", replies: [{author: "Dr. Evelyn Reed"}, {author: "Alex Doe"}], status: "Open", materials: [{}] },
  { id: "2", title: "Help with SN1 vs. SN2 Reactions", description: "What are the key factors to decide if a reaction is SN1 or SN2? The solvent effects are particularly tricky for me.", course: "Organic Chemistry", author: "Charlie Brown", authorAvatar: "https://i.pravatar.cc/150?u=charlie", replies: [], status: "Open", materials: [] },
  { id: "3", title: "Aristotle's Four Causes", description: "I've read the chapter, but I'm looking for more examples of the material, formal, efficient, and final causes. The textbook is a bit dry.", course: "Ancient Philosophy", author: "Bob Williams", authorAvatar: "https://i.pravatar.cc/150?u=bob", replies: [{author: "Dr. Samuel Green"}], status: "Closed", materials: [] },
];

function CreateTopicDialog({ onSave }: { onSave: (topic: Omit<Topic, 'id' | 'author' | 'authorAvatar' | 'replies' | 'status' | 'materials'>) => void }) {
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
        toast({ title: "Topic Created!", description: "Your request for help has been posted." });
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
  const { user } = useAuth();
  const isStudent = user.role === "student";

  useEffect(() => {
    const storedTopics = localStorage.getItem("topics");
    if (storedTopics) {
      setTopics(JSON.parse(storedTopics));
    } else {
      localStorage.setItem("topics", JSON.stringify(initialTopics));
      setTopics(initialTopics);
    }
  }, []);

  useEffect(() => {
    // This will listen for changes in other tabs
    const handleStorageChange = () => {
        const storedTopics = localStorage.getItem("topics");
        if (storedTopics) {
            setTopics(JSON.parse(storedTopics));
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);



  const handleCreateTopic = (newTopic: Omit<Topic, 'id' | 'author' | 'authorAvatar' | 'replies' | 'status' | 'materials'>) => {
    const topic: Topic = {
        ...newTopic,
        id: (topics.length + 1).toString(),
        author: user.name,
        authorAvatar: user.avatar,
        replies: [],
        status: "Open",
        materials: []
    };
    const newTopics = [topic, ...topics];
    setTopics(newTopics);
    localStorage.setItem("topics", JSON.stringify(newTopics));
  };
  
  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">Help Topics</h1>
            {isStudent && <CreateTopicDialog onSave={handleCreateTopic} />}
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-lg">{topic.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={topic.authorAvatar} alt={topic.author} />
                    <Fallback>{topic.author.charAt(0)}</Fallback>
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
                    <span>{topic.replies.length} Replies</span>
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
        ))}
      </div>
    </div>
  );
}

const Fallback = AvatarFallback;
