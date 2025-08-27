
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type Lesson = {
    id: string;
    title: string;
    type: 'article' | 'video' | 'quiz' | 'pdf' | 'youtube';
    content: string; // For article: markdown; for others: URL
    duration?: string; // Optional
    completed: boolean;
};

export type Module = {
    id: string;
    title: string;
    lessons: Lesson[];
    assignedLecturers?: string[];
    assignedTutors?: string[];
};

export type Course = {
    id:string;
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

export async function uploadCourseFile(courseId: string, file: File): Promise<string> {
    if (!storage) throw new Error("Firebase Storage not initialized");
    const storageRef = ref(storage, `courses/${courseId}/lessons/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}
