
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { addUser, deleteUser, getUsers, updateUser, User } from "@/services/user-service";

function UserDialog({ onSave, user, children }: { onSave: (user: User, password?: string) => void; user?: User; children: React.ReactNode }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<User['role']>(user?.role || "student");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const isEditing = !!user;

  const handleSave = () => {
    if (!name || !email) {
        toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive"});
        return;
    }
    if (!isEditing && !password) {
        toast({ title: "Validation Error", description: "Password is required for new users.", variant: "destructive"});
        return;
    }

    const userData: User = {
        id: user?.id || '',
        name,
        email,
        role,
        status: user?.status || "Active",
        avatar: user?.avatar || `https://i.pravatar.cc/150?u=${name.split(' ')[0]}`
    };

    onSave(userData, isEditing ? undefined : password);
    setOpen(false);
  };
  
  useEffect(() => {
    if (open) {
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setPassword("");
      } else {
          setName("");
          setEmail("");
          setRole("student");
          setPassword("");
      }
    }
  }, [user, open]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update the details for this user account." : "Enter the details for the new user account."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.s@campus.edu" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
             <Select value={role} onValueChange={(value: User['role']) => setRole(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
                <SelectItem value="lecturer">Lecturer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isEditing && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Set initial password" className="col-span-3" />
            </div>
          )}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchUsers = async () => {
    try {
        const userList = await getUsers();
        setUsers(userList);
    } catch(error) {
        toast({ title: "Error fetching users", description: "Could not load user data from the database.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);


  const handleSaveUser = async (user: User, password?: string) => {
    const isEditing = !!user.id;
    if (isEditing) {
        await handleUpdateUser(user);
    } else {
        await handleAddUser(user, password!);
    }
  };

  const handleAddUser = async (user: User, password: string) => {
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
        // This should also delete from Firebase Auth, which is not implemented yet.
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
        <UserDialog onSave={handleSaveUser}>
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
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.name}</p>
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
                                    <UserDialog onSave={handleSaveUser} user={user}>
                                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">Edit</button>
                                    </UserDialog>
                                    <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                                        {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DeleteUserAlert userId={user.id} onDelete={handleDeleteUser} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
