
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { Course } from './course-service';
import { User } from './user-service';

export type Assignment = {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  dueDate: string;
};

export type SubmissionStatus = "Submitted" | "Graded" | "In Progress";

export type Submission = {
    id: string;
    studentId: string;
    studentName: string;
    studentAvatar: string;
    courseId: string;
    courseTitle: string;
    assignmentId: string;
    assignmentName: string;
    submittedDate: string; 
    submissionContent: string;
    status: SubmissionStatus;
    feedback?: string;
    grade?: string;
}

// For Students: Get assignments for all enrolled courses
export async function getStudentAssignments(studentId: string, enrolledCourses: Course[]): Promise<(Assignment & {status: SubmissionStatus, submissionId?: string})[]> {
    if (!db || enrolledCourses.length === 0) return [];
    
    const courseIds = enrolledCourses.map(c => c.id);
    
    // 1. Get all assignments for the student's courses
    const assignmentsCollection = collection(db, 'assignments');
    const assignmentsQuery = query(assignmentsCollection, where("courseId", "in", courseIds));
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));

    // 2. Get all submissions by the student to check status
    const submissionsCollection = collection(db, 'submissions');
    const submissionsQuery = query(submissionsCollection, where("studentId", "==", studentId));
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));

    // 3. Map status to each assignment
    return assignments.map(assignment => {
        const submission = submissions.find(s => s.assignmentId === assignment.id);
        return {
            ...assignment,
            status: submission ? submission.status : 'In Progress',
            submissionId: submission?.id
        };
    });
}

// For Tutors/Lecturers: Get submissions for all assigned courses
export async function getTutorSubmissions(tutor: User, allCourses: Course[]): Promise<Submission[]> {
    if (!db) return [];
    
    const assignedCourseIds = tutor.assignedCourses || [];
    if (assignedCourseIds.length === 0) return [];

    const submissionsCollection = collection(db, 'submissions');
    const q = query(submissionsCollection, where("courseId", "in", assignedCourseIds), where("status", "==", "Submitted"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
}

// Create a new assignment
export async function addAssignment(assignment: Omit<Assignment, 'id'>): Promise<string> {
    if (!db) throw new Error("Firebase not initialized");
    const assignmentsCollection = collection(db, 'assignments');
    const docRef = await addDoc(assignmentsCollection, assignment);
    return docRef.id;
}

// Get assignments for a single course
export async function getCourseAssignments(courseId: string): Promise<Assignment[]> {
    if (!db) return [];
    const assignmentsCollection = collection(db, 'assignments');
    const q = query(assignmentsCollection, where("courseId", "==", courseId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment));
}

// Submit work for an assignment
export async function addSubmission(submission: Omit<Submission, 'id' | 'status' | 'feedback' | 'grade'>): Promise<string> {
    if (!db) throw new Error("Firebase not initialized");
    
    const submissionToAdd = {
        ...submission,
        status: "Submitted" as SubmissionStatus,
        feedback: "",
        grade: ""
    }

    const submissionsCollection = collection(db, 'submissions');
    const docRef = await addDoc(submissionsCollection, submissionToAdd);
    return docRef.id;
}

// Update a submission (e.g., to mark as graded)
export async function updateSubmission(id: string, data: Partial<Submission>): Promise<void> {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, 'submissions', id);
    await updateDoc(docRef, data);
}
