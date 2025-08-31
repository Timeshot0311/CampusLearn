
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, getUser, toggleSubscription, getUserTopics, Topic } from "@/services/user-service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Rss } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfileHoverCard } from "@/components/user-profile-hover-card";


function PublicUserTopics({ user }: { user: User }) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.id) return;
        const fetchUserTopics = async () => {
            setLoading(true);
            const userTopics = await getUserTopics(user.id);
            setTopics(userTopics);
            setLoading(false);
        };
        fetchUserTopics();
    }, [user.id]);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>{user.name.split(' ')[0]}'s Topics</CardTitle>
                <CardDescription>A history of all the topics created by this user.</CardDescription>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topics.map(topic => (
                                <TableRow key={topic.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/topics/${topic.id}`} className="hover:underline">{topic.title}</Link>
                                    </TableCell>
                                    <TableCell>{topic.course}</TableCell>
                                    <TableCell>{topic.replies?.length || 0}</TableCell>
                                    <TableCell><Badge variant={topic.status === 'Closed' ? 'destructive' : 'default'}>{topic.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-6">
                        <MessageSquare className="mx-auto h-12 w-12" />
                        <p className="mt-4">This user has not created any topics yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


export default function ProfileClient({ userId }: { userId: string }) {
    const { user: currentUser, loading: authLoading } = useAuth();
    const { toast } = useToast();
    
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            setLoading(true);
            const user = await getUser(userId);
            setProfileUser(user);
            setLoading(false);
        };
        fetchUser();
    }, [userId]);

    const handleToggleSubscription = async () => {
        if (!currentUser || !profileUser) return;
        setSubscribing(true);
        try {
            await toggleSubscription(currentUser.id, profileUser.id);
            // Optimistically update the UI
            setProfileUser(prev => {
                if (!prev) return null;
                const isSubscribed = prev.subscribers?.includes(currentUser.id);
                const subscribers = isSubscribed
                    ? prev.subscribers?.filter(id => id !== currentUser.id)
                    : [...(prev.subscribers || []), currentUser.id];
                return { ...prev, subscribers };
            });
            toast({ title: isSubscribed ? "Unsubscribed" : "Subscribed!" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        setSubscribing(false);
    };

    if (loading || authLoading) {
        return (
             <div className="flex flex-col gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
             </div>
        );
    }

    if (!profileUser) {
        return <p>User not found.</p>;
    }
    
    const isOwnProfile = currentUser?.id === profileUser.id;
    const isSubscribed = profileUser.subscribers?.includes(currentUser.id) || false;
    const initials = profileUser.name.split(' ').map(n => n[0]).join('') || "";

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                        <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                        <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl">{profileUser.name}</CardTitle>
                        <CardDescription className="capitalize text-base">{profileUser.role}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span><strong className="text-foreground">{profileUser.subscribers?.length || 0}</strong> Subscribers</span>
                        <span><strong className="text-foreground">{profileUser.subscribing?.length || 0}</strong> Subscribing</span>
                    </div>
                </CardHeader>
                {!isOwnProfile && (
                     <CardFooter>
                        <Button className="w-full" onClick={handleToggleSubscription} disabled={subscribing} variant={isSubscribed ? "outline" : "default"}>
                            {subscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rss className="mr-2 h-4 w-4" />}
                            {subscribing ? "Updating..." : isSubscribed ? "Unsubscribe" : "Subscribe"}
                        </Button>
                    </CardFooter>
                )}
            </Card>

            <PublicUserTopics user={profileUser} />
        </div>
    );
}
