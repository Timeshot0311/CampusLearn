
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateUser, User, getUserTopics, Topic, getUserSubscriptions, getUserSubscribers } from "@/services/user-service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Users, UserCheck, Rss } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileHoverCard } from "@/components/user-profile-hover-card";

function UserTopics({ user }: { user: User }) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserTopics = async () => {
            const userTopics = await getUserTopics(user.id);
            setTopics(userTopics);
            setLoading(false);
        };
        fetchUserTopics();
    }, [user.id]);

    return (
        <Card>
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


function UserConnections({ userId }: { userId: string }) {
    const [subscribers, setSubscribers] = useState<User[]>([]);
    const [subscriptions, setSubscriptions] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            setLoading(true);
            const [subs, subbed] = await Promise.all([
                getUserSubscribers(userId),
                getUserSubscriptions(userId)
            ]);
            setSubscribers(subs);
            setSubscriptions(subbed);
            setLoading(false);
        };
        fetchConnections();
    }, [userId]);

    const renderUserList = (list: User[], emptyMessage: string) => {
        if (loading) return <p>Loading...</p>;
        if (list.length === 0) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
        
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.map(user => (
                    <Card key={user.id} className="flex items-center p-3 gap-3">
                         <UserProfileHoverCard user={user}>
                            <Link href={`/profile/${user.id}`}>
                                <Avatar>
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                        </UserProfileHoverCard>
                        <div className="flex-1">
                             <UserProfileHoverCard user={user}>
                                <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">{user.name}</Link>
                            </UserProfileHoverCard>
                            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Connections</CardTitle>
                <CardDescription>Users who subscribe to you and users you subscribe to.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="subscribers">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="subscribers"><Users className="mr-2 h-4 w-4"/>Subscribers ({subscribers.length})</TabsTrigger>
                        <TabsTrigger value="subscriptions"><Rss className="mr-2 h-4 w-4"/>Subscribing ({subscriptions.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="subscribers" className="pt-4">
                        {renderUserList(subscribers, "You don't have any subscribers yet.")}
                    </TabsContent>
                    <TabsContent value="subscriptions" className="pt-4">
                        {renderUserList(subscriptions, "You are not subscribed to any users yet.")}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setAvatarUrl(user?.avatar || "");
  }, [user]);

  const initials = user?.name.split(' ').map(n => n[0]).join('') || "";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateUser(user.id, { name, avatar: avatarUrl });
      toast({ title: "Profile Updated", description: "Your details have been successfully saved." });
      // Note: In a real app, you might need to refresh the auth state or user context
      // For now, we manually update the local state to reflect changes. A page refresh would show the new name in the header.
       // This is a simplified way to trigger a re-render in useAuth to reflect the new name, in a real app this would be more robust
       window.location.reload();
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
                            <AvatarImage src={avatarUrl} alt={user?.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-2 flex-grow">
                            <Label htmlFor="avatar">Avatar URL</Label>
                            <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
                        </div>
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
        <UserConnections userId={user.id} />
    </div>
  );
}
