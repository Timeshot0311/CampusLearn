
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export type Lesson = {
    title: string;
    type: 'video' | 'reading' | 'quiz';
    duration: string;
    completed?: boolean; // This will be a per-student status, but for structure it's here
};

export type Module = {
    id: string;
    title: string;
    lessons: Lesson[];
};

export type Course = {
    id: string;
    title: string;
    description: string;
    instructor: string;
    progress: number;
    image: string;
    dataAiHint: string;
    ownerId: string;
    published: boolean;
    modules: Module[]; 
};

export async function getCourses(): Promise<Course[]> {
    if (!db) return [];
    const coursesCollection = collection(db, 'courses');
    const snapshot = await getDocs(coursesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

export async function getCourse(id: string): Promise<Course | null> {
    if (!db) return null;
    const docRef = doc(db, 'courses', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Course;
    }
    return null;
}

export async function addCourse(course: Omit<Course, 'id'>): Promise<string> {
    if (!db) throw new Error("Firebase not initialized");
    const coursesCollection = collection(db, 'courses');
    const docRef = await addDoc(coursesCollection, course);
    return docRef.id;
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, course);
}

export async function deleteCourse(id: string): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'courses', id);
    await deleteDoc(docRef);
}
