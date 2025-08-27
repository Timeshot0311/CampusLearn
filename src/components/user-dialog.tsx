
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
import { useToast } from "@/hooks/use-toast";
import { User, Role } from "@/services/user-service";
import { Course } from "@/services/course-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, MultiSelectOption } from "./ui/multi-select";

interface UserDialogProps {
  user?: User;
  courses: Course[];
  onAdd?: (user: Omit<User, "id">, password: string) => void;
  onUpdate?: (user: User) => void;
  children: React.ReactNode;
}

export function UserDialog({ user, courses, onAdd, onUpdate, children }: UserDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [assignedCourses, setAssignedCourses] = useState<string[]>([]);

  const { toast } = useToast();
  const isEditing = !!user;

  useEffect(() => {
    if (open) {
      if (isEditing) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setAssignedCourses(user.assignedCourses || []);
        setPassword("");
      } else {
        setName("");
        setEmail("");
        setRole("student");
        setAssignedCourses([]);
        setPassword("");
      }
    }
  }, [open, user, isEditing]);

  const courseOptions: MultiSelectOption[] = courses.map(c => ({
    value: c.id,
    label: c.title,
  }));

  const handleSave = () => {
    if (isEditing) {
      if (!name || !email || !role) {
        toast({ title: "Validation Error", description: "Name, email, and role are required.", variant: "destructive" });
        return;
      }
      onUpdate?.({ ...user, name, email, role, assignedCourses });
    } else {
      if (!name || !email || !role || !password) {
        toast({ title: "Validation Error", description: "All fields are required for new users.", variant: "destructive" });
        return;
      }
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        role,
        assignedCourses,
        status: 'Active',
        avatar: `https://i.pravatar.cc/150?u=${name.split(' ').join('')}`,
      };
      onAdd?.(newUser, password);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the user's details." : "Enter the details for the new user."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {!isEditing && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger>
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
          {(role === 'tutor' || role === 'lecturer') && (
            <div className="grid gap-2">
                <Label>Assigned Courses</Label>
                <MultiSelect
                    options={courseOptions}
                    selected={assignedCourses}
                    onChange={setAssignedCourses}
                    placeholder="Assign courses..."
                />
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>{isEditing ? "Save Changes" : "Add User"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
