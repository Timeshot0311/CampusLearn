
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateUser, User } from "@/services/user-service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageSquare } from "lucide-react";
import { getTopics, Topic } from "@/services/topic-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function UserTopics({ user }: { user: User }) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserTopics = async () => {
            const allTopics = await getTopics();
            setTopics(allTopics.filter(t => t.author === user.name));
            setLoading(false);
        };
        fetchUserTopics();
    }, [user.name]);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>My Help Topics</CardTitle>
                <CardDescription>A history of all the topics you have created.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>Loading topics...</p>
                ) : topics.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Topic</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Replies</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topics.map(topic => (
                                <TableRow key={topic.id}>
                                    <TableCell className="font-medium">{topic.title}</TableCell>
                                    <TableCell>{topic.course}</TableCell>
                                    <TableCell>{topic.replies?.length || 0}</TableCell>
                                    <TableCell><Badge variant={topic.status === 'Closed' ? 'destructive' : 'default'}>{topic.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/topics/${topic.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-6">
                        <MessageSquare className="mx-auto h-12 w-12" />
                        <p className="mt-4">You have not created any topics yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const initials = user?.name.split(' ').map(n => n[0]).join('') || "";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateUser(user.id, { name });
      toast({ title: "Profile Updated", description: "Your details have been successfully saved." });
      // Note: In a real app, you might need to refresh the auth state or user context
      // For now, the auth context doesn't auto-update on this change. A page refresh would show the new name in the header.
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (authLoading) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <Card>
            <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Update your personal information here.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" disabled>Change Avatar</Button>
                    </div>
                    <div className="grid gap-2 max-w-sm">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                     <div className="grid gap-2 max-w-sm">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ""} disabled />
                         <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>

        {user.role === 'student' && <UserTopics user={user} />}
    </div>
  );
}
