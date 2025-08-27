
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit, AlertCircle } from "lucide-react";
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

import { useState, useReducer } from "react";
import { useToast } from "@/hooks/use-toast";

type User = {
    id: string;
    name: string;
    email: string;
    role: "student" | "tutor" | "admin";
    status: "Active" | "Inactive";
    avatar: string;
};

const initialUsers: User[] = [
    { id: "1", name: "Alex Doe", email: "alex.doe@campus.edu", role: "student", status: "Active", avatar: "https://i.pravatar.cc/150?u=alex" },
    { id: "2", name: "Dr. Evelyn Reed", email: "e.reed@campus.edu", role: "tutor", status: "Active", avatar: "https://i.pravatar.cc/150?u=evelyn" },
    { id: "3", name: "Sam Wallace", email: "s.wallace@campus.edu", role: "admin", status: "Active", avatar: "https://i.pravatar.cc/150?u=sam" },
    { id: "4", name: "Bob Williams", email: "bob.w@campus.edu", role: "student", status: "Inactive", avatar: "https://i.pravatar.cc/150?u=bob" },
    { id: "5", name: "Charlie Brown", email: "charlie.b@campus.edu", role: "student", status: "Active", avatar: "https://i.pravatar.cc/150?u=charlie" },
];

type Action = 
    | { type: 'ADD_USER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'DELETE_USER'; payload: string };

function usersReducer(state: User[], action: Action): User[] {
    switch (action.type) {
        case 'ADD_USER':
            return [...state, action.payload];
        case 'UPDATE_USER':
            return state.map(user => user.id === action.payload.id ? action.payload : user);
        case 'DELETE_USER':
            return state.filter(user => user.id !== action.payload);
        default:
            return state;
    }
}


function UserDialog({ onSave, user, children }: { onSave: (user: User) => void; user?: User; children: React.ReactNode }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<User['role']>(user?.role || "student");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!name || !email) {
        toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive"});
        return;
    }
    onSave({
        id: user?.id || Date.now().toString(),
        name,
        email,
        role,
        status: user?.status || "Active",
        avatar: user?.avatar || `https://i.pravatar.cc/150?u=${name.split(' ')[0]}`
    });
    setOpen(false);
    toast({ title: `User ${user ? 'updated' : 'added'} successfully!`});
  };

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
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">Delete</button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account.
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
  const [users, dispatch] = useReducer(usersReducer, initialUsers);
  const { toast } = useToast();

  const handleAddUser = (user: User) => {
    dispatch({ type: 'ADD_USER', payload: user });
  };

  const handleUpdateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const handleDeleteUser = (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
    toast({ title: "User deleted successfully." });
  };
  
  const handleSuspendUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: {...user, status: user.status === "Active" ? "Inactive" : "Active"} });
    toast({ title: `User has been ${user.status === "Active" ? "suspended" : "reactivated"}.` });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">User Management</h1>
        <UserDialog onSave={handleAddUser}>
             <Button>Add User</Button>
        </UserDialog>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all user accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
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
                            <DropdownMenuItem asChild>
                                <UserDialog onSave={handleUpdateUser} user={user}>
                                    <button className="w-full text-left">Edit</button>
                                </UserDialog>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                                {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <DeleteUserAlert userId={user.id} onDelete={handleDeleteUser} />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
