
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from "firebase/auth";
import type { Course } from './course-service';

export type Role = "student" | "tutor" | "lecturer" | "admin";

export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: "Active" | "Inactive";
    avatar: string;
    assignedCourses?: string[];
};

export async function getUsers(): Promise<User[]> {
    if (!db) return [];
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getUser(id: string): Promise<User | null> {
    if (!db) return null;
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
}

export async function addUser(user: Omit<User, 'id'>, password: string): Promise<string> {
    if (!auth || !db) throw new Error("Firebase not initialized");

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, password);
    const authUser = userCredential.user;

    // Now, create the user document in Firestore with the UID from authentication
    const userDocRef = doc(db, 'users', authUser.uid);
    await setDoc(userDocRef, user);

    return authUser.uid;
}

export async function updateUser(id: string, user: Partial<User>): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    // Note: This doesn't update email in Firebase Auth, which requires re-authentication.
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, user);
}

export async function setUser(id: string, user: Omit<User, 'id'>): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'users', id);
    await setDoc(docRef, user);
}


export async function deleteUser(id: string): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    // Note: This only deletes from Firestore. A real app needs a Cloud Function 
    // to delete the user from Firebase Auth when their Firestore doc is deleted.
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
}

export function getUserCourses(user: User, courses: Course[]): string[] {
    if (user.role === 'tutor' || user.role === 'lecturer') {
        return user.assignedCourses || [];
    }
    if (user.role === 'student') {
        return courses
            .filter(course => course.enrolledStudents?.includes(user.id))
            .map(course => course.id);
    }
    return [];
};

