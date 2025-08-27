
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
import { Paperclip, FileText, Video, Music, Send, MoreVertical, Download, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getTopic, updateTopic, addReply, addMaterial, Topic, TopicStatus, TopicReply } from "@/services/topic-service";
import { Skeleton } from "@/components/ui/skeleton";


function MaterialIcon({ type }: { type: string }) {
    if (type.startsWith('video')) return <Video className="h-5 w-5 text-muted-foreground" />;
    if (type.startsWith('audio')) return <Music className="h-5 w-5 text-muted-foreground" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-muted-foreground" />;
    return <Paperclip className="h-5 w-5 text-muted-foreground" />;
}

export default function TopicDetailClient({ topicId }: { topicId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isTutorOrLecturerOrAdmin = user.role === "tutor" || user.role === "lecturer" || user.role === "admin";
  const isClosed = topic?.status === "Closed";
  const canReply = !isClosed || isTutorOrLecturerOrAdmin;


  useEffect(() => {
    if (!topicId) return;
    const fetchTopic = async () => {
        try {
            const fetchedTopic = await getTopic(topicId);
            setTopic(fetchedTopic);
        } catch (error) {
            toast({ title: "Error fetching topic", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    fetchTopic();
  }, [topicId, toast]);


  const handleSendReply = async () => {
    if (!newReply.trim() || !canReply || !topic) return;
    setReplying(true);

    const reply: TopicReply = {
        author: user.name,
        authorAvatar: user.avatar,
        role: user.role,
        text: newReply,
        timestamp: new Date().toISOString(), // Use ISO string for consistency
    };
    
    try {
        await addReply(topic.id, reply);
        setTopic(prev => prev ? { ...prev, replies: [...(prev.replies || []), reply] } : null);
        setNewReply("");
        toast({ title: "Reply posted!" });
    } catch (error) {
        toast({ title: "Error posting reply", variant: "destructive" });
    } finally {
        setReplying(false);
    }
  }

  const handleDownload = (materialUrl: string, materialName: string) => {
    window.open(materialUrl, '_blank');
    toast({ title: "Downloading...", description: `${materialName} will open in a new tab.` });
  }

  const handleStatusChange = async (status: TopicStatus) => {
    if (!topic) return;
    try {
        await updateTopic(topic.id, { status });
        setTopic(prev => prev ? { ...prev, status } : null);
        toast({ title: "Topic Status Updated", description: `The topic has been marked as ${status}.`});
    } catch (error) {
        toast({ title: "Error updating status", variant: "destructive" });
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && topic) {
        setUploading(true);
        try {
            const newMaterial = await addMaterial(topic.id, file);
            setTopic(prev => prev ? { ...prev, materials: [...(prev.materials || []), newMaterial] } : null);
            toast({ title: "File Uploaded!", description: `${file.name} has been added.` });
        } catch (error) {
            toast({ title: "Error uploading file", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    }
  };

  if (loading) {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader><Skeleton className="h-24 w-full" /></CardHeader>
                    <CardContent><Skeleton className="h-64 w-full" /></CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                    <CardContent><Skeleton className="h-32 w-full" /></CardContent>
                </Card>
            </div>
        </div>
    )
  }

  if (!topic) {
    return <div>Topic not found.</div>;
  }


  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline">{topic.course}</Badge>
                <CardTitle className="mt-2 text-3xl font-headline">{topic.title}</CardTitle>
                <CardDescription className="mt-2">{topic.description}</CardDescription>
              </div>
               <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Badge variant={topic.status === 'Closed' ? 'destructive' : topic.status === 'Reopened' ? 'secondary' : 'default'} className="capitalize">{topic.status}</Badge>
                            {isTutorOrLecturerOrAdmin && <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>}
                        </div>
                    </DropdownMenuTrigger>
                     {isTutorOrLecturerOrAdmin && (
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange("Open")}>Mark as Open</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("Reopened")}>Mark as Reopened</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("Closed")}>Mark as Closed</DropdownMenuItem>
                        </DropdownMenuContent>
                      )}
                </DropdownMenu>
               </div>
            </div>
             <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={topic.authorAvatar} alt={topic.author} />
                    <AvatarFallback>{topic.author?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Created by {topic.author}</span>
              </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold font-headline mb-4">Discussion</h2>
            <div className="space-y-6">
              {topic.replies?.map((reply, index) => (
                <div key={index} className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={reply.authorAvatar} alt={reply.author} />
                        <AvatarFallback>{reply.author?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{reply.author} <span className="text-xs font-normal text-muted-foreground capitalize">({reply.role})</span></p>
                            <p className="text-xs text-muted-foreground">{new Date(reply.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{reply.text}</p>
                    </div>
                </div>
              ))}
              {(!topic.replies || topic.replies.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No replies yet.</p>
              )}
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
                    disabled={!canReply || replying}
                />
                <Button className="absolute bottom-3 right-3" size="sm" onClick={handleSendReply} disabled={!newReply.trim() || !canReply || replying}>
                    {replying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {replying ? "Sending..." : "Send"}
                    {!replying && <Send className="ml-2 h-4 w-4"/>}
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
             {topic.materials?.map((material) => (
                <div key={material.name} className="flex items-center p-3 rounded-md border justify-between">
                    <div className="flex items-center gap-3 truncate">
                        <MaterialIcon type={material.type} />
                        <span className="text-sm font-medium truncate">{material.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => handleDownload(material.url, material.name)}>
                        <Download className="h-4 w-4"/>
                    </Button>
                </div>
             ))}
             {(!topic.materials || topic.materials.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No materials uploaded yet.</p>
             )}
             {isTutorOrLecturerOrAdmin && (
                <div className="pt-4">
                    <label htmlFor="file-upload" className="w-full text-sm font-medium text-primary cursor-pointer inline-block p-4 border-2 border-dashed border-primary/50 rounded-lg text-center hover:bg-primary/10">
                        {uploading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                <span>Upload New Material</span>
                            </div>
                        )}
                    </label>
                    <Input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
