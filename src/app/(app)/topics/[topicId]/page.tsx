
"use client";
import { useState } from "react";
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
import { Paperclip, FileText, Video, Music, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const topicData = {
  id: "1",
  title: "Confused about Quantum Tunneling",
  description: "Can someone explain the probability calculation for a particle to tunnel through a barrier? I'm not getting it. Specifically, I'm stuck on how the wave function decays inside the barrier and what the transmission coefficient represents. An example calculation would be amazing!",
  course: "Quantum Computing",
  author: "Alex Doe",
  authorAvatar: "https://i.pravatar.cc/150?u=alex",
  status: "Open",
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
    { name: "Tunneling_Example.pdf", type: "pdf", icon: FileText },
    { name: "Intro_to_Tunneling.mp4", type: "video", icon: Video },
    { name: "Quantum_Wave_Function_Audio_Explanation.mp3", type: "audio", icon: Music },
  ]
};

function MaterialIcon({ type }: { type: string }) {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-muted-foreground" />;
    if (type === 'video') return <Video className="h-5 w-5 text-muted-foreground" />;
    if (type === 'audio') return <Music className="h-5 w-5 text-muted-foreground" />;
    return <Paperclip className="h-5 w-5 text-muted-foreground" />;
}

export default function TopicDetailPage({ params }: { params: { topicId: string } }) {
  const { user } = useAuth();
  const [newReply, setNewReply] = useState("");
  const isTutorOrLecturer = user.role === "tutor" || user.role === "lecturer";

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
              <Badge variant={topicData.status === 'Open' ? 'default' : 'secondary'}>{topicData.status}</Badge>
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
                    placeholder="Type your message here..." 
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    rows={4}
                    className="pr-24"
                />
                <Button className="absolute bottom-3 right-3" size="sm">
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
            <CardDescription>Resources uploaded by tutors for this topic.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             {topicData.materials.map(material => (
                <div key={material.name} className="flex items-center p-2 rounded-md border hover:bg-muted/50 justify-between">
                    <div className="flex items-center gap-3">
                        <MaterialIcon type={material.type} />
                        <span className="text-sm font-medium">{material.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                </div>
             ))}
             {isTutorOrLecturer && (
                <div className="pt-4">
                    <Label htmlFor="file-upload" className="w-full text-sm font-medium text-primary cursor-pointer inline-block p-4 border-2 border-dashed border-primary/50 rounded-lg text-center hover:bg-primary/10">
                        <div className="flex items-center justify-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span>Upload New Material</span>
                        </div>
                    </Label>
                    <Input id="file-upload" type="file" className="hidden" />
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
