
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Role } from '@/hooks/use-auth';

export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: "Active" | "Inactive";
    avatar: string;
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

export async function addUser(user: Omit<User, 'id'>): Promise<string> {
    if (!db) throw new Error("Firebase not initialized");
    const usersCollection = collection(db, 'users');
    const docRef = await addDoc(usersCollection, user);
    return docRef.id;
}

export async function updateUser(id: string, user: Partial<User>): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
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
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
}
