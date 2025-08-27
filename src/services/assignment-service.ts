import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export type Assignment = {
  id: string;
  name: string;
  course: string;
  dueDate: string;
  status: "Submitted" | "In Progress" | "Not Started";
};

export type Submission = {
    id: string;
    student: string;
    avatar: string;
    course: string;
    assignment: string;
    submitted: string;
    submission: string; // The actual content
}

const assignmentsCollection = collection(db, 'assignments');
const submissionsCollection = collection(db, 'submissions');


export async function getStudentAssignments(studentId: string): Promise<Assignment[]> {
    // This is a simplified query. In a real app, you'd likely query based on courses the student is enrolled in.
    const snapshot = await getDocs(assignmentsCollection);
    // The status would also likely be stored per-student, not on the assignment itself.
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
}


export async function getTutorSubmissions(tutorId: string): Promise<Submission[]> {
     // This is a simplified query. In a real app, you'd query based on courses the tutor manages.
    const snapshot = await getDocs(submissionsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
}
