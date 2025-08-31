

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { addUser, deleteUser, getUsers, updateUser, User, getUserCourses } from "@/services/user-service";
import { getCourses, Course } from "@/services/course-service";
import { EnrollStudentDialog } from "@/components/enroll-student-dialog";
import { UserDialog } from "@/components/user-dialog";
import { UserProfileHoverCard } from "@/components/user-profile-hover-card";
import Link from "next/link";

function DeleteUserAlert({ userId, onDelete }: { userId: string, onDelete: (id: string) => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive focus:text-destructive">Delete</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account from both authentication and the database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(userId)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [userList, courseList] = await Promise.all([getUsers(), getCourses()]);
        setUsers(userList);
        setCourses(courseList);
    } catch(error) {
        toast({ title: "Error fetching data", description: "Could not load user and course data.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddUser = async (user: Omit<User, 'id'>, password: string) => {
    try {
        const newUserId = await addUser(user, password);
        setUsers([...users, {...user, id: newUserId}]);
        toast({ title: "User created successfully!"});
    } catch (error: any) {
        toast({ title: "Error adding user", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
        await updateUser(user.id, user);
        setUsers(users.map(u => u.id === user.id ? user : u));
        toast({ title: "User updated successfully!"});
    } catch (error: any) {
        toast({ title: "Error updating user", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        toast({ title: "User deleted successfully." });
    } catch (error: any) {
        toast({ title: "Error deleting user", description: error.message, variant: "destructive" });
    }
  };
  
  const handleSuspendUser = async (user: User) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    const updatedUser = {...user, status: newStatus };
    try {
        await updateUser(user.id, updatedUser);
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
        toast({ title: `User has been ${newStatus === 'Inactive' ? "suspended" : "reactivated"}.` });
    } catch (error: any) {
        toast({ title: "Error updating user status", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">User Management</h1>
        <UserDialog onAdd={handleAddUser} courses={courses}>
             <Button>Add User</Button>
        </UserDialog>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all user accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Courses</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((user) => {
                       const userCourses = getUserCourses(user, courses);
                       return (
                        <TableRow key={user.id}>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <UserProfileHoverCard user={user}>
                                    <Link href={`/profile/${user.id}`}>
                                        <Avatar>
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </UserProfileHoverCard>
                                <div>
                                    <UserProfileHoverCard user={user}>
                                        <Link href={`/profile/${user.id}`} className="font-medium hover:underline">{user.name}</Link>
                                    </UserProfileHoverCard>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                        </TableCell>
                        <TableCell>
                           {userCourses.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                    {userCourses.map(courseId => {
                                        const course = courses.find(c => c.id === courseId);
                                        return (
                                            <TooltipProvider key={courseId} delayDuration={100}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="secondary" className="truncate">{course?.title || 'Unknown Course'}</Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{course?.title || 'Unknown Course'}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )
                                    })}
                                </div>
                            ) : (user.role === 'student' || user.role === 'tutor' || user.role === 'lecturer') ? 'None' : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <UserDialog onUpdate={handleUpdateUser} user={user} courses={courses}>
                                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">Edit</button>
                                    </UserDialog>
                                    {user.role === 'student' && (
                                        <EnrollStudentDialog allUsers={[user]} allCourses={courses} onEnrollmentChanged={fetchData} fromUser>
                                             <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">Enroll in Course</button>
                                        </EnrollStudentDialog>
                                    )}
                                    <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                                        {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DeleteUserAlert userId={user.id} onDelete={handleDeleteUser} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                       )
                    })}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
