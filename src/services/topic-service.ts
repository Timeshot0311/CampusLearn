
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

export type TopicStatus = "Open" | "Closed" | "Reopened";

export type LearningMaterial = {
  name: string;
  type: string;
  url: string;
}

export type TopicReply = {
    author: string;
    authorId: string;
    authorAvatar: string;
    role: string;
    text: string;
    timestamp: string;
}

export type Question = {
    question: string;
    options: string[];
    answer: number;
    explanation?: string;
};

export type Quiz = {
    id: string;
    title: string;
    questions: Question[];
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  course: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  replies: TopicReply[]; 
  status: TopicStatus;
  materials: LearningMaterial[];
  subscribers?: string[];
  quizzes?: Quiz[];
};

export type Notification = {
    id: string;
    userId: string;
    text: string;
    link: string; // Generic link instead of just topicId
    isRead: boolean;
    timestamp: string;
}

export async function getTopics(): Promise<Topic[]> {
    if (!db) return [];
    const topicsCollection = collection(db, 'topics');
    const snapshot = await getDocs(topicsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
}

export async function getTopic(id: string): Promise<Topic | null> {
    if (!db) return null;
    const docRef = doc(db, 'topics', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Topic;
    }
    return null;
}

export async function addTopic(topic: Omit<Topic, 'id'>): Promise<string> {
    if (!db) throw new Error("Firebase not initialized");
    const topicsCollection = collection(db, 'topics');
    const docRef = await addDoc(topicsCollection, topic);
    return docRef.id;
}

export async function updateTopic(id: string, topic: Partial<Topic>): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'topics', id);
    await updateDoc(docRef, topic);
}

export async function deleteTopic(id: string): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'topics', id);
    await deleteDoc(docRef);
}

export async function addReply(topicId: string, reply: TopicReply): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const topic = await getTopic(topicId);
    if (topic) {
        const updatedReplies = [...(topic.replies || []), reply];
        await updateTopic(topicId, { replies: updatedReplies });
    }
}

export async function addMaterial(topicId: string, file: File): Promise<LearningMaterial> {
    if (!db || !storage) throw new Error("Firebase not initialized");
    const topic = await getTopic(topicId);
    if (!topic) throw new Error("Topic not found");

    const storageRef = ref(storage, `topics/${topicId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const newMaterial: LearningMaterial = {
        name: file.name,
        type: file.type,
        url,
    };

    const updatedMaterials = [...(topic.materials || []), newMaterial];
    await updateTopic(topicId, { materials: updatedMaterials });

    return newMaterial;
}


export async function addNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    if (!db) throw new Error("Firebase not initialized");
    const notificationsCollection = collection(db, 'notifications');
    const docRef = await addDoc(notificationsCollection, notification);
    return docRef.id;
}


export async function getNotifications(userId: string): Promise<Notification[]> {
    if (!db) return [];
    const notificationsCollection = collection(db, 'notifications');
    const q = query(
        notificationsCollection, 
        where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    
    // Sort on the client to avoid needing a composite index
    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { isRead: true });
}

export async function addQuiz(topicId: string, quizData: Omit<Quiz, 'id'>): Promise<Quiz> {
    if (!db) throw new Error("Firebase not initialized");
    const topic = await getTopic(topicId);
    if (!topic) throw new Error("Topic not found");

    const newQuiz: Quiz = {
        id: uuidv4(),
        ...quizData
    };

    const updatedQuizzes = [...(topic.quizzes || []), newQuiz];
    await updateTopic(topicId, { quizzes: updatedQuizzes });

    return newQuiz;
}
