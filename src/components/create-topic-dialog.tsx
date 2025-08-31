
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addTopic, Topic, addNotification } from "@/services/topic-service";
import { Course } from "@/services/course-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getUsers, User } from "@/services/user-service";

interface CreateTopicDialogProps {
  courses: Course[];
  defaultCourseId?: string;
  onTopicCreated: (newTopic: Topic) => void;
  children: React.ReactNode;
}

export function CreateTopicDialog({
  courses,
  defaultCourseId,
  onTopicCreated,
  children
}: CreateTopicDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [courseId, setCourseId] = useState(defaultCourseId || "");
    const [isGeneral, setIsGeneral] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setTitle("");
            setDescription("");
            setCourseId(defaultCourseId || "");
            setIsGeneral(false);

            // Fetch all users to determine who to notify
            const fetchUsers = async () => {
                const users = await getUsers();
                setAllUsers(users);
            };
            fetchUsers();
        }
    }, [open, defaultCourseId]);

    const handleSave = async () => {
        const selectedCourse = courses.find(c => c.id === courseId);
        const courseName = isGeneral 
            ? "General" 
            : selectedCourse?.title;
        
        if (!title || !description || !courseName) {
            toast({ title: "Missing Fields", description: "Please fill out all fields to create a topic.", variant: "destructive" });
            return;
        }

        try {
            const topicToAdd: Omit<Topic, 'id'> = {
                title,
                description,
                course: courseName,
                author: user.name,
                authorId: user.id,
                authorAvatar: user.avatar,
                replies: [],
                status: "Open",
                materials: []
            };
            const newTopicId = await addTopic(topicToAdd);
            const newTopic = { ...topicToAdd, id: newTopicId };
            onTopicCreated(newTopic);

            // --- Notification Logic ---
            const notificationPromises: Promise<any>[] = [];
            const notifiedUserIds = new Set<string>([user.id]);
            const notificationLink = `/topics/${newTopicId}`;

            // 1. Notify assigned staff
            if (selectedCourse && !isGeneral) {
                const staffIds = [...(selectedCourse.assignedLecturers || []), ...(selectedCourse.assignedTutors || [])];
                for (const staffId of staffIds) {
                    if (!notifiedUserIds.has(staffId)) {
                        notificationPromises.push(addNotification({
                            userId: staffId,
                            text: `${user.name} created a new topic in "${courseName}": "${title}"`,
                            link: notificationLink,
                            isRead: false,
                            timestamp: new Date().toISOString(),
                        }));
                        notifiedUserIds.add(staffId);
                    }
                }
            }

            // 2. Notify author's subscribers
            const authorData = allUsers.find(u => u.id === user.id);
            if (authorData && authorData.subscribers) {
                for (const subscriberId of authorData.subscribers) {
                    if (!notifiedUserIds.has(subscriberId)) {
                         notificationPromises.push(addNotification({
                            userId: subscriberId,
                            text: `${user.name} created a new topic: "${title}"`,
                            link: notificationLink,
                            isRead: false,
                            timestamp: new Date().toISOString(),
                        }));
                        notifiedUserIds.add(subscriberId);
                    }
                }
            }

            await Promise.all(notificationPromises);
            // --- End Notification Logic ---
            
            setOpen(false);
        } catch (error) {
            toast({ title: "Error creating topic", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Help Topic</DialogTitle>
                    <DialogDescription>
                        Describe the subject you need help with. A tutor or lecturer will respond soon.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Topic Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., 'Help with Photosynthesis'" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="course">Related Course</Label>
                        <Select 
                            value={courseId} 
                            onValueChange={setCourseId}
                            disabled={isGeneral}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="general-topic" 
                            checked={isGeneral}
                            onCheckedChange={(checked) => setIsGeneral(checked as boolean)}
                        />
                        <label
                            htmlFor="general-topic"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                           Mark as a general topic (not course-related)
                        </label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your question in detail..." rows={5} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Create Topic</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
