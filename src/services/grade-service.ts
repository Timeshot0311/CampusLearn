import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export type Grade = {
  id: string;
  assignment: string;
  course: string;
  grade: string;
  score: string;
};

export type TutorGradebookEntry = {
    id: string;
    student: string;
    course: string;
    assignment: string;
    grade: string;
}

export async function getStudentGrades(studentId: string): Promise<Grade[]> {
    if (!db) return [];
    const gradesCollection = collection(db, 'grades');
    // In a real app, you would query for grades where studentId matches.
    const snapshot = await getDocs(gradesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
}

export async function getTutorGradebook(tutorId: string): Promise<TutorGradebookEntry[]> {
    if (!db) return [];
    const gradesCollection = collection(db, 'grades');
    // In a real app, you would query for grades in courses taught by the tutor.
    const snapshot = await getDocs(gradesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TutorGradebookEntry));
}
