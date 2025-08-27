
"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileSidebar } from "./sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { getNotifications, markNotificationAsRead, Notification } from "@/services/topic-service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userNotifications = await getNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        toast({ title: "Error fetching notifications", variant: "destructive"});
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user?.id, toast, open]);

  const handleNotificationClick = async (notification: Notification) => {
      await markNotificationAsRead(notification.id);
      setOpen(false);
      router.push(`/topics/${notification.topicId}`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {unreadCount}
                    </span>
                )}
                <span className="sr-only">Toggle notifications</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                        Recent activity on your topics.
                    </p>
                </div>
                <div className="grid gap-2">
                    {loading ? (
                        <p>Loading...</p>
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div key={notification.id} onClick={() => handleNotificationClick(notification)} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 cursor-pointer">
                                <span className={`flex h-2 w-2 translate-y-1.5 rounded-full ${notification.isRead ? 'bg-muted' : 'bg-sky-500'}`} />
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium">
                                        {notification.text}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">No new notifications</p>
                    )}
                </div>
            </div>
        </PopoverContent>
    </Popover>
  )
}


export default function AppHeader() {
  const { user } = useAuth();
  const initials = user.name.split(' ').map(n => n[0]).join('');

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <MobileSidebar />
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses, topics..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <NotificationBell />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
            <Link href="/">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
