
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { User } from './user-service';

export type Grade = {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  assignmentName: string;
  courseName: string;
  grade: string; // e.g. "A+", "Pass", "85%"
  score?: number; // e.g. 85
  feedback?: string;
  gradedBy: string; // Tutor/Lecturer user ID
  date: string;
};

export async function getStudentGrades(studentId: string): Promise<Grade[]> {
    if (!db) return [];
    const gradesCollection = collection(db, 'grades');
    const q = query(gradesCollection, where("studentId", "==", studentId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
}

export async function getTutorGradebook(tutor: User): Promise<Grade[]> {
    if (!db) return [];
    const assignedCourseIds = tutor.assignedCourses || [];
    if (assignedCourseIds.length === 0) return [];
    
    const gradesCollection = collection(db, 'grades');
    const q = query(gradesCollection, where("courseId", "in", assignedCourseIds));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
}

export async function addGrade(grade: Omit<Grade, 'id'>): Promise<string> {
    if (!db) throw new Error("Firebase not initialized");
    const gradesCollection = collection(db, 'grades');
    const docRef = await addDoc(gradesCollection, grade);
    return docRef.id;
}
