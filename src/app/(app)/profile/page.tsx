
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/services/user-service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

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
    </div>
  );
}
