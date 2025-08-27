import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type TopicStatus = "Open" | "Closed" | "Reopened";

export type LearningMaterial = {
  name: string;
  type: string;
  url: string;
}

export type TopicReply = {
    author: string;
    authorAvatar: string;
    role: string;
    text: string;
    timestamp: string;
}

export type Topic = {
  id: string;
  title: string;
  description: string;
  course: string;
  author: string;
  authorAvatar: string;
  replies: TopicReply[]; 
  status: TopicStatus;
  materials: LearningMaterial[];
};

const topicsCollection = collection(db, 'topics');

export async function getTopics(): Promise<Topic[]> {
    const snapshot = await getDocs(topicsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
}

export async function getTopic(id: string): Promise<Topic | null> {
    const docRef = doc(db, 'topics', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Topic;
    }
    return null;
}

export async function addTopic(topic: Omit<Topic, 'id'>): Promise<string> {
    const docRef = await addDoc(topicsCollection, topic);
    return docRef.id;
}

export async function updateTopic(id: string, topic: Partial<Topic>): Promise<void> {
    const docRef = doc(db, 'topics', id);
    await updateDoc(docRef, topic);
}

export async function addReply(topicId: string, reply: TopicReply): Promise<void> {
    const topic = await getTopic(topicId);
    if (topic) {
        const updatedReplies = [...(topic.replies || []), reply];
        await updateTopic(topicId, { replies: updatedReplies });
    }
}

export async function addMaterial(topicId: string, file: File): Promise<LearningMaterial> {
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
