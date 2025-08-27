import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

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
    modules: any[]; // Define a proper type for modules later
};

const coursesCollection = collection(db, 'courses');

export async function getCourses(): Promise<Course[]> {
    const snapshot = await getDocs(coursesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

export async function getCourse(id: string): Promise<Course | null> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Course;
    }
    return null;
}

export async function addCourse(course: Omit<Course, 'id'>): Promise<string> {
    const docRef = await addDoc(coursesCollection, course);
    return docRef.id;
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<void> {
    const docRef = doc(db, 'courses', id);
    await updateDoc(docRef, course);
}

export async function deleteCourse(id: string): Promise<void> {
    const docRef = doc(db, 'courses', id);
    await deleteDoc(docRef);
}
