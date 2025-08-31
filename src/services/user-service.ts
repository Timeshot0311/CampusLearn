
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, writeBatch, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from "firebase/auth";
import type { Course } from './course-service';
import type { Topic } from './topic-service';

export type Role = "student" | "tutor" | "lecturer" | "admin";

export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: "Active" | "Inactive";
    avatar: string;
    assignedCourses?: string[];
    subscribers?: string[];
    subscribing?: string[];
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

export async function getUserTopics(userId: string): Promise<Topic[]> {
    if (!db) return [];
    const topicsCollection = collection(db, 'topics');
    const q = query(topicsCollection, where("authorId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
}

export async function toggleSubscription(currentUserId: string, targetUserId: string) {
    if (!db) throw new Error("Firebase not initialized");
    if (currentUserId === targetUserId) throw new Error("You cannot subscribe to yourself.");

    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    const batch = writeBatch(db);

    const [currentUserDoc, targetUserDoc] = await Promise.all([
        getDoc(currentUserRef),
        getDoc(targetUserRef)
    ]);

    if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
        throw new Error("User not found.");
    }

    const currentUserData = currentUserDoc.data() as User;
    const targetUserData = targetUserDoc.data() as User;

    const isSubscribed = targetUserData.subscribers?.includes(currentUserId);

    if (isSubscribed) {
        // Unsubscribe
        const updatedSubscribing = currentUserData.subscribing?.filter(id => id !== targetUserId) || [];
        const updatedSubscribers = targetUserData.subscribers?.filter(id => id !== currentUserId) || [];
        batch.update(currentUserRef, { subscribing: updatedSubscribing });
        batch.update(targetUserRef, { subscribers: updatedSubscribers });
    } else {
        // Subscribe
        const updatedSubscribing = [...(currentUserData.subscribing || []), targetUserId];
        const updatedSubscribers = [...(targetUserData.subscribers || []), currentUserId];
        batch.update(currentUserRef, { subscribing: updatedSubscribing });
        batch.update(targetUserRef, { subscribers: updatedSubscribers });
    }

    await batch.commit();
}


async function getUsersFromIds(userIds: string[]): Promise<User[]> {
    if (!db || !userIds || userIds.length === 0) return [];
    
    const users: User[] = [];
    // Firestore 'in' query is limited to 30 items. We batch them if needed.
    const batches = [];
    for (let i = 0; i < userIds.length; i += 30) {
        batches.push(userIds.slice(i, i + 30));
    }

    for (const batch of batches) {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('__name__', 'in', batch));
        const snapshot = await getDocs(q);
        users.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    }

    return users;
}

export async function getUserSubscribers(userId: string): Promise<User[]> {
    const user = await getUser(userId);
    if (!user || !user.subscribers) return [];
    return getUsersFromIds(user.subscribers);
}

export async function getUserSubscriptions(userId: string): Promise<User[]> {
    const user = await getUser(userId);
    if (!user || !user.subscribing) return [];
    return getUsersFromIds(user.subscribing);
}
