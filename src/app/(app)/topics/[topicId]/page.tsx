

"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, FileText, Video, Music, Send, MoreVertical, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


const topicsData = {
  "1": {
    id: "1",
    title: "Confused about Quantum Tunneling",
    description: "Can someone explain the probability calculation for a particle to tunnel through a barrier? I'm not getting it. Specifically, I'm stuck on how the wave function decays inside the barrier and what the transmission coefficient represents. An example calculation would be amazing!",
    course: "Quantum Computing",
    author: "Alex Doe",
    authorAvatar: "https://i.pravatar.cc/150?u=alex",
    status: "Open" as TopicStatus,
    replies: [
      {
        author: "Dr. Evelyn Reed",
        authorAvatar: "https://i.pravatar.cc/150?u=evelyn",
        role: "tutor",
        text: "Great question, Alex! The key is the Schrödinger equation. Inside the barrier (where V > E), the solution is a decaying exponential. The transmission coefficient (T) is essentially the ratio of the squared amplitude of the transmitted wave to the incident wave. It's usually very small. I've attached a PDF with a worked example.",
        timestamp: "2 hours ago",
      },
      {
        author: "Alex Doe",
        authorAvatar: "https://i.pravatar.cc/150?u=alex",
        role: "student",
        text: "Thanks, Dr. Reed! The PDF is super helpful. The example makes it much clearer now. So, T depends exponentially on the barrier width and the energy difference (V-E)?",
        timestamp: "1 hour ago",
      }
    ],
    materials: [
      { name: "Tunneling_Example.pdf", type: "pdf" },
      { name: "Intro_to_Tunneling.mp4", type: "video" },
      { name: "Quantum_Wave_Function_Audio_Explanation.mp3", type: "audio" },
    ]
  },
  "2": {
    id: "2",
    title: "Help with SN1 vs. SN2 Reactions",
    description: "What are the key factors to decide if a reaction is SN1 or SN2? The solvent effects are particularly tricky for me.",
    course: "Organic Chemistry",
    author: "Charlie Brown",
    authorAvatar: "https://i.pravatar.cc/150?u=charlie",
    status: "Open" as TopicStatus,
    replies: [],
    materials: []
  },
  "3": {
    id: "3",
    title: "Aristotle's Four Causes",
    description: "I've read the chapter, but I'm looking for more examples of the material, formal, efficient, and final causes. The textbook is a bit dry.",
    course: "Ancient Philosophy",
    author: "Bob Williams",
    authorAvatar: "https://i.pravatar.cc/150?u=bob",
    status: "Closed" as TopicStatus,
    replies: [
        {
            author: "Dr. Samuel Green",
            authorAvatar: "https://i.pravatar.cc/150?u=samuel",
            role: "lecturer",
            text: "Let's use a simple example: a wooden chair. The material cause is the wood. The formal cause is the design or shape of the chair. The efficient cause is the carpenter who built it. The final cause is its purpose: to be sat upon.",
            timestamp: "3 days ago"
        }
    ],
    materials: []
  }
}

type TopicStatus = "Open" | "Closed" | "Reopened";

function getTopicFromStorage(topicId: string) {
    if (typeof window === 'undefined') return topicsData[topicId as keyof typeof topicsData] || topicsData["1"];
    const storedTopics = localStorage.getItem('topics');
    if (storedTopics) {
        const topics = JSON.parse(storedTopics);
        return topics.find((t: any) => t.id === topicId) || topicsData[topicId as keyof typeof topicsData] || topicsData["1"];
    }
    return topicsData[topicId as keyof typeof topicsData] || topicsData["1"];
}

function updateTopicInStorage(topic: any) {
    if (typeof window === 'undefined') return;
    const storedTopics = localStorage.getItem('topics');
    if (storedTopics) {
        const topics = JSON.parse(storedTopics);
        const index = topics.findIndex((t: any) => t.id === topic.id);
        if (index !== -1) {
            topics[index] = topic;
            localStorage.setItem('topics', JSON.stringify(topics));
        }
    }
}


function MaterialIcon({ type }: { type: string }) {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-muted-foreground" />;
    if (type === 'video') return <Video className="h-5 w-5 text-muted-foreground" />;
    if (type === 'audio') return <Music className="h-5 w-5 text-muted-foreground" />;
    return <Paperclip className="h-5 w-5 text-muted-foreground" />;
}

export default function TopicDetailPage({ params }: { params: { topicId: string } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topicData, setTopicData] = useState(() => getTopicFromStorage(params.topicId));

  const [newReply, setNewReply] = useState("");
  const isTutorOrLecturerOrAdmin = user.role === "tutor" || user.role === "lecturer" || user.role === "admin";
  const isClosed = topicData.status === "Closed";
  const canReply = !isClosed || isTutorOrLecturerOrAdmin;


  const handleSendReply = () => {
    if (!newReply.trim() || !canReply) return;

    const reply = {
        author: user.name,
        authorAvatar: user.avatar,
        role: user.role,
        text: newReply,
        timestamp: "Just now",
    };
    
    const updatedTopic = {
        ...topicData,
        replies: [...topicData.replies, reply],
    };

    setTopicData(updatedTopic);
    updateTopicInStorage(updatedTopic);

    setNewReply("");
    toast({ title: "Reply posted!" });
  }

  const handleDownload = (materialName: string) => {
    toast({ title: "Downloading...", description: `${materialName} will be downloaded.` });
  }

  const handleStatusChange = (status: TopicStatus) => {
    const updatedTopic = { ...topicData, status };
    setTopicData(updatedTopic);
    updateTopicInStorage(updatedTopic);
    toast({ title: "Topic Status Updated", description: `The topic has been marked as ${status}.`});
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      const newMaterial = {
        name: file.name,
        type: file.type.split('/')[0] || 'file' // pdf, video, audio etc.
      };
      const updatedTopic = {
        ...topicData,
        materials: [...topicData.materials, newMaterial]
      };
      setTopicData(updatedTopic);
      updateTopicInStorage(updatedTopic);
      toast({
        title: "File Uploaded!",
        description: `${file.name} has been added to the learning materials.`
      });
    }
  };


  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline">{topicData.course}</Badge>
                <CardTitle className="mt-2 text-3xl font-headline">{topicData.title}</CardTitle>
                <CardDescription className="mt-2">{topicData.description}</CardDescription>
              </div>
               <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Badge variant={topicData.status === 'Closed' ? 'destructive' : topicData.status === 'Reopened' ? 'secondary' : 'default'} className="capitalize">{topicData.status}</Badge>
                            {isTutorOrLecturerOrAdmin && <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>}
                        </div>
                    </DropdownMenuTrigger>
                     {isTutorOrLecturerOrAdmin && (
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange("Open")} className="text-green-600 focus:text-green-600">Mark as Open</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("Reopened")} className="text-blue-600 focus:text-blue-600">Mark as Reopened</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("Closed")} className="text-red-600 focus:text-red-600">Mark as Closed</DropdownMenuItem>
                        </DropdownMenuContent>
                      )}
                </DropdownMenu>
               </div>
            </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={topicData.authorAvatar} alt={topicData.author} />
                    <AvatarFallback>{topicData.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Created by {topicData.author}</span>
              </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold font-headline mb-4">Discussion</h2>
            <div className="space-y-6">
              {topicData.replies.map((reply, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={reply.authorAvatar} alt={reply.author} />
                    <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{reply.author} <span className="text-xs font-normal text-muted-foreground capitalize">({reply.role})</span></p>
                        <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                    </div>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{reply.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 pt-6 border-t">
             <h3 className="font-semibold">Post a Reply</h3>
             <div className="w-full relative">
                <Textarea 
                    placeholder={!canReply ? "This topic is closed for students." : "Type your message here..."}
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    rows={4}
                    className="pr-24"
                    disabled={!canReply}
                />
                <Button className="absolute bottom-3 right-3" size="sm" onClick={handleSendReply} disabled={!newReply.trim() || !canReply}>
                    Send <Send className="ml-2 h-4 w-4"/>
                </Button>
             </div>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Learning Materials</CardTitle>
            <CardDescription>Resources uploaded for this topic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             {topicData.materials.map(material => (
                <div key={material.name} className="flex items-center p-3 rounded-md border justify-between">
                    <div className="flex items-center gap-3 truncate">
                        <MaterialIcon type={material.type} />
                        <span className="text-sm font-medium truncate">{material.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => handleDownload(material.name)}>
                        <Download className="h-4 w-4"/>
                    </Button>
                </div>
             ))}
             {topicData.materials.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No materials uploaded yet.</p>
             )}
             {isTutorOrLecturerOrAdmin && (
                <div className="pt-4">
                    <Label htmlFor="file-upload" className="w-full text-sm font-medium text-primary cursor-pointer inline-block p-4 border-2 border-dashed border-primary/50 rounded-lg text-center hover:bg-primary/10">
                        <div className="flex items-center justify-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span>Upload New Material</span>
                        </div>
                    </Label>
                    <Input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    