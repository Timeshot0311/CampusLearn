
"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, FileText, Video, Music, Send, MoreVertical, Download, ClipboardCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";


type TopicStatus = "Open" | "Closed" | "Reopened";

function getTopicFromStorage(topicId: string) {
    if (typeof window === 'undefined') return null;
    const storedTopics = localStorage.getItem('topics');
    if (storedTopics) {
        const topics = JSON.parse(storedTopics);
        return topics.find((t: any) => t.id === topicId) || null;
    }
    return null;
}

function updateTopicInStorage(topic: any) {
    if (typeof window === 'undefined') return;
    const storedTopics = localStorage.getItem('topics');
    let allTopics = storedTopics ? JSON.parse(storedTopics) : [];

    const index = allTopics.findIndex((t: any) => t.id === topic.id);
    if (index !== -1) {
        allTopics[index] = topic;
    } else {
        allTopics.push(topic);
    }
    localStorage.setItem('topics', JSON.stringify(allTopics));
    window.dispatchEvent(new Event('storage'));
}


function MaterialIcon({ type }: { type: string }) {
    if (type.startsWith('video')) return <Video className="h-5 w-5 text-muted-foreground" />;
    if (type.startsWith('audio')) return <Music className="h-5 w-5 text-muted-foreground" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-muted-foreground" />;
    return <Paperclip className="h-5 w-5 text-muted-foreground" />;
}

export default function TopicDetailClient({ topicId }: { topicId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topicData, setTopicData] = useState<any>(null);

  useEffect(() => {
    setTopicData(getTopicFromStorage(topicId));
  }, [topicId]);

  const [newReply, setNewReply] = useState("");
  const isTutorOrLecturerOrAdmin = user.role === "tutor" || user.role === "lecturer" || user.role === "admin";
  const isClosed = topicData?.status === "Closed";
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
      const newMaterial = {
        name: file.name,
        type: file.type.split('/')[0] || 'file'
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

  if (!topicData) {
    return <div>Loading topic...</div>;
  }


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
                    <AvatarFallback>{topicData.author?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Created by {topicData.author}</span>
              </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold font-headline mb-4">Discussion</h2>
            <div className="space-y-6">
              {topicData.replies.map((reply: any, index: number) => (
                reply.author && reply.text && (
                    <div key={index} className="flex items-start gap-4">
                        <Avatar>
                            <AvatarImage src={reply.authorAvatar} alt={reply.author} />
                            <AvatarFallback>{reply.author?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{reply.author} <span className="text-xs font-normal text-muted-foreground capitalize">({reply.role})</span></p>
                                <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                            </div>
                            <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{reply.text}</p>
                        </div>
                    </div>
                )
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
             {topicData.materials.map((material: any) => (
                material.name && (
                    <div key={material.name} className="flex items-center p-3 rounded-md border justify-between">
                        <div className="flex items-center gap-3 truncate">
                            <MaterialIcon type={material.type} />
                            <span className="text-sm font-medium truncate">{material.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => handleDownload(material.name)}>
                            <Download className="h-4 w-4"/>
                        </Button>
                    </div>
                )
             ))}
             {topicData.materials.filter((m: any) => m.name).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No materials uploaded yet.</p>
             )}
             {isTutorOrLecturerOrAdmin && (
                <div className="pt-4">
                    <label htmlFor="file-upload" className="w-full text-sm font-medium text-primary cursor-pointer inline-block p-4 border-2 border-dashed border-primary/50 rounded-lg text-center hover:bg-primary/10">
                        <div className="flex items-center justify-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span>Upload New Material</span>
                        </div>
                    </label>
                    <Input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
