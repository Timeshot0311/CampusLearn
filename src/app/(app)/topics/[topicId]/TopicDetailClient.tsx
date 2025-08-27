
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
import { Paperclip, FileText, Video, Music, Send, MoreVertical, Download, Loader2, BellRing, BellOff, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getTopic, updateTopic, addReply, addMaterial, Topic, TopicStatus, TopicReply, addNotification, LearningMaterial, Quiz, addQuiz } from "@/services/topic-service";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizGeneratorDialog } from "@/components/quiz-generator-dialog";
import { QuizTakerDialog } from "@/components/quiz-taker-dialog";


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
  const isTutorOrLecturer = user.role === "tutor" || user.role === "lecturer";
  const isClosed = topic?.status === "Closed";
  
  const canTutorReply = isTutorOrLecturer ? user.assignedCourses?.includes(topic?.course || '') : true;
  const canReply = (!isClosed && (user.role === 'student' || canTutorReply)) || isTutorOrLecturerOrAdmin;

  const isSubscribed = topic?.subscribers?.includes(user.id);

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
        timestamp: new Date().toISOString(),
    };
    
    try {
        await addReply(topic.id, reply);

        // Send notifications to subscribers
        if (topic.subscribers && topic.subscribers.length > 0) {
            for (const subscriberId of topic.subscribers) {
                if (subscriberId !== user.id) { // Don't notify the person who replied
                    await addNotification({
                        userId: subscriberId,
                        text: `${user.name} replied to the topic: "${topic.title}"`,
                        topicId: topic.id,
                        isRead: false,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        }


        setTopic(prev => prev ? { ...prev, replies: [...(prev.replies || []), reply] } : null);
        setNewReply("");
        toast({ title: "Reply posted!" });
    } catch (error) {
        toast({ title: "Error posting reply", variant: "destructive" });
    } finally {
        setReplying(false);
    }
  }

  const handleToggleSubscription = async () => {
    if (!topic) return;

    const currentSubscribers = topic.subscribers || [];
    const newSubscribers = isSubscribed 
        ? currentSubscribers.filter(id => id !== user.id)
        : [...currentSubscribers, user.id];
    
    try {
        await updateTopic(topic.id, { subscribers: newSubscribers });
        setTopic(prev => prev ? { ...prev, subscribers: newSubscribers } : null);
        toast({ title: isSubscribed ? "Unsubscribed" : "Subscribed!", description: `You will ${isSubscribed ? 'no longer' : 'now'} receive notifications for this topic.`});
    } catch (error) {
        toast({ title: "Error updating subscription", variant: "destructive" });
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

  const handleQuizSave = async (quiz: Omit<Quiz, 'id'>) => {
    if (!topic) return;
    try {
        const newQuiz = await addQuiz(topic.id, quiz);
        setTopic(prev => prev ? { ...prev, quizzes: [...(prev.quizzes || []), newQuiz] } : null);
        toast({ title: "Quiz Saved!", description: "The new quiz is available for students."});
    } catch (error) {
        toast({ title: "Error saving quiz", variant: "destructive" });
    }
  }

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
    <div className="grid md:grid-cols-4 gap-6">
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline">{topic.course}</Badge>
                <CardTitle className="mt-2 text-3xl font-headline">{topic.title}</CardTitle>
                <CardDescription className="mt-2">{topic.description}</CardDescription>
              </div>
               <div className="flex items-center gap-2">
                <Button variant={isSubscribed ? "default" : "outline"} size="sm" onClick={handleToggleSubscription}>
                    {isSubscribed ? <BellOff className="mr-2 h-4 w-4" /> : <BellRing className="mr-2 h-4 w-4" />}
                    {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                </Button>
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
                    placeholder={
                        isClosed ? "This topic is closed." :
                        !canReply && isTutorOrLecturer ? `You are not assigned to the "${topic.course}" course and cannot reply.` :
                        "Type your message here..."
                    }
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    rows={4}
                    className="pr-24"
                    disabled={!canReply || replying || isClosed}
                />
                <Button className="absolute bottom-3 right-3" size="sm" onClick={handleSendReply} disabled={!newReply.trim() || !canReply || replying || isClosed}>
                    {replying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {replying ? "Sending..." : "Send"}
                    {!replying && <Send className="ml-2 h-4 w-4"/>}
                </Button>
             </div>
          </CardFooter>
        </Card>
      </div>

      <div className="md:col-span-1 space-y-6">
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
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary"/>
                    <CardTitle className="font-headline">Interactive Quizzes</CardTitle>
                </div>
                <CardDescription>Practice quizzes for this topic.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {topic.quizzes?.map((quiz) => (
                    <div key={quiz.id} className="flex items-center p-3 rounded-md border justify-between">
                        <span className="text-sm font-medium">{quiz.title}</span>
                         <QuizTakerDialog quiz={quiz} />
                    </div>
                ))}
                {(!topic.quizzes || topic.quizzes.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No quizzes available yet.</p>
                )}
            </CardContent>
            {isTutorOrLecturerOrAdmin && (
                <CardFooter>
                    <QuizGeneratorDialog onSave={handleQuizSave} />
                </CardFooter>
            )}
        </Card>
      </div>
    </div>
  );
}
