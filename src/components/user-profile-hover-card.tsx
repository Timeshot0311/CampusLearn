
"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/services/user-service";
import { Rss, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

interface UserProfileHoverCardProps {
  user: User;
  children: React.ReactNode;
}

export function UserProfileHoverCard({ user, children }: UserProfileHoverCardProps) {
    const { user: currentUser } = useAuth();
    if (!user) return <>{children}</>;

    const isOwnProfile = currentUser?.id === user.id;

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                    <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-grow">
                        <h4 className="text-sm font-semibold">{user.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                        <div className="flex items-center pt-2">
                             <Users className="mr-2 h-4 w-4 opacity-70" />{" "}
                             <span className="text-xs text-muted-foreground">{user.subscribers?.length || 0} subscribers</span>
                        </div>
                         <div className="flex items-center">
                            <Rss className="mr-2 h-4 w-4 opacity-70" />{" "}
                            <span className="text-xs text-muted-foreground">subscribing to {user.subscribing?.length || 0} users</span>
                        </div>
                    </div>
                    {!isOwnProfile && (
                         <Button asChild variant="outline">
                            <Link href={`/profile/${user.id}`}>Profile</Link>
                        </Button>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
