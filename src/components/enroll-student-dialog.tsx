
"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Course, updateCourse } from "@/services/course-service";
import { User } from "@/services/user-service";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Loader2 } from "lucide-react";

interface EnrollStudentDialogProps {
  allUsers: User[];
  course?: Course;
  allCourses?: Course[];
  fromUser?: boolean;
  onEnrollmentChanged: () => void;
  children: React.ReactNode;
}

export function EnrollStudentDialog({
  allUsers,
  course,
  allCourses = [],
  fromUser = false,
  onEnrollmentChanged,
  children,
}: EnrollStudentDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for enrolling students into one course
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // State for enrolling one student into multiple courses
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (fromUser) {
        // Pre-select courses the user is already in
        const user = allUsers[0];
        const userCourses = allCourses.filter(c => c.enrolledStudents?.includes(user.id)).map(c => c.id);
        setSelectedCourses(userCourses);
        setSelectedStudents([user.id]);
      } else if (course) {
        // Pre-select students already in the course
        setSelectedStudents(course.enrolledStudents || []);
      }
    }
  }, [open, fromUser, course, allUsers, allCourses]);

  const studentOptions = allUsers
    .filter(u => u.role === 'student')
    .map(u => ({ value: u.id, label: u.name }));
    
  const courseOptions = allCourses.map(c => ({ value: c.id, label: c.title }));

  const handleSave = async () => {
    setLoading(true);
    try {
      if (fromUser) {
        // Enroll one user into multiple courses
        const userId = allUsers[0].id;
        // Courses to add user to
        const coursesToEnroll = selectedCourses.filter(courseId => !allCourses.find(c => c.id === courseId)?.enrolledStudents?.includes(userId));
        // Courses to remove user from
        const coursesToUnenroll = allCourses.filter(c => c.enrolledStudents?.includes(userId) && !selectedCourses.includes(c.id)).map(c => c.id);

        await Promise.all([
          ...coursesToEnroll.map(courseId => {
            const c = allCourses.find(c => c.id === courseId)!;
            const enrolledStudents = [...(c.enrolledStudents || []), userId];
            return updateCourse(courseId, { enrolledStudents });
          }),
          ...coursesToUnenroll.map(courseId => {
            const c = allCourses.find(c => c.id === courseId)!;
            const enrolledStudents = c.enrolledStudents?.filter(sid => sid !== userId) || [];
            return updateCourse(courseId, { enrolledStudents });
          })
        ]);

      } else if (course) {
        // Enroll multiple students into one course
        await updateCourse(course.id, { enrolledStudents: selectedStudents });
      }

      toast({ title: "Enrollments Updated Successfully!" });
      onEnrollmentChanged();
      setOpen(false);
    } catch (error: any) {
      toast({ title: "Error Updating Enrollments", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {fromUser ? `Enroll ${allUsers[0]?.name}` : `Enroll Students in ${course?.title}`}
          </DialogTitle>
          <DialogDescription>
             {fromUser ? `Select the courses to enroll ${allUsers[0]?.name} in.` : "Select the students to enroll in this course."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {fromUser ? (
                 <div className="grid gap-2">
                    <Label>Courses</Label>
                    <MultiSelect
                        options={courseOptions}
                        selected={selectedCourses}
                        onChange={setSelectedCourses}
                        placeholder="Select courses..."
                    />
                </div>
            ) : (
                <div className="grid gap-2">
                    <Label>Students</Label>
                    <MultiSelect
                        options={studentOptions}
                        selected={selectedStudents}
                        onChange={setSelectedStudents}
                        placeholder="Select students..."
                    />
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
