
# CampusLearn - Firebase Firestore Data Model

This document outlines the logical data model for the CampusLearn platform, which is implemented using Firebase Firestore, a NoSQL document database.

## Model Choice: Document Model

A Document Model was chosen because it aligns perfectly with Firestore's structure. Data is stored in flexible, JSON-like documents, which allows for rich, hierarchical data structures (like embedding `lessons` within `modules` in a `course`) and scalable querying. This model provides the flexibility needed for a modern, evolving application.

---

## Collections and Document Structures

Our database is organized into several top-level collections. Below are the core entities and their document structures.

### 1. `users` Collection

Stores information about every individual on the platform.

**Represents:** Student, Tutor, Lecturer, Admin
**Document Structure:**
```json
{
  "id": "string (doc.id)",
  "name": "string",
  "email": "string",
  "role": "string ('student' | 'tutor' | 'lecturer' | 'admin')",
  "status": "string ('Active' | 'Inactive')",
  "avatar": "string (URL to image)",
  "assignedCourses": ["string (array of course IDs)"], // For tutors/lecturers
  "subscribers": ["string (array of user IDs)"],
  "subscribing": ["string (array of user IDs)"]
}
```

### 2. `courses` Collection

Stores all course information, including their structure.

**Represents:** Course, Module, Lesson
**Document Structure:**
```json
{
  "id": "string (doc.id)",
  "title": "string",
  "description": "string",
  "instructor": "string (Name of the primary instructor)",
  "ownerId": "string (User ID of the creator)",
  "image": "string (URL to cover image)",
  "published": "boolean",
  "assignedLecturers": ["string (array of user IDs)"],
  "assignedTutors": ["string (array of user IDs)"],
  "enrolledStudents": ["string (array of user IDs)"],
  "modules": [
    {
      "id": "string (uuid)",
      "title": "string",
      "lessons": [
        {
          "id": "string (uuid)",
          "title": "string",
          "type": "string ('article' | 'video' | 'quiz' | etc.)",
          "content": "string (Markdown content or URL)"
        }
      ]
    }
  ]
}
```
*Note: `modules` and `lessons` are embedded directly within the `course` document. This is efficient for retrieval as the entire course structure can be fetched in a single read.*

### 3. `topics` Collection

Stores records for the forum-style help topics.

**Represents:** Topic, TopicReply
**Document Structure:**
```json
{
  "id": "string (doc.id)",
  "title": "string",
  "description": "string",
  "course": "string (Course Title, or 'General')",
  "authorId": "string (User ID of the creator)",
  "author": "string (Name of the creator)",
  "authorAvatar": "string (URL to avatar)",
  "status": "string ('Open' | 'Closed' | 'Reopened')",
  "subscribers": ["string (array of user IDs)"],
  "materials": [
    {
      "name": "string",
      "type": "string (MIME type)",
      "url": "string (URL to file in Firebase Storage)"
    }
  ],
  "quizzes": [
    {
      "id": "string (uuid)",
      "title": "string",
      "questions": [
        {
          "question": "string",
          "options": ["string"],
          "answer": "number (index of correct option)"
        }
      ]
    }
  ],
  "replies": [
    {
      "authorId": "string",
      "author": "string",
      "authorAvatar": "string (URL)",
      "role": "string",
      "text": "string",
      "timestamp": "string (ISO 8601)"
    }
  ]
}
```

### 4. `assignments` Collection

Defines the assignments for each course.

**Document Structure:**
```json
{
  "id": "string (doc.id)",
  "courseId": "string",
  "courseTitle": "string",
  "name": "string",
  "dueDate": "string (ISO 8601)"
}
```

### 5. `submissions` Collection

Tracks each student's submission for an assignment.

**Document Structure:**
```json
{
  "id": "string (doc.id)",
  "studentId": "string",
  "assignmentId": "string",
  "courseId": "string",
  "studentName": "string",
  "assignmentName": "string",
  "courseTitle": "string",
  "submittedDate": "string (ISO 8601)",
  "submissionContent": "string (URL to file in Firebase Storage)",
  "status": "string ('Submitted' | 'Graded' | 'In Progress')",
  "grade": "string (e.g., 'A+', '85%')",
  "feedback": "string"
}
```

### 6. `grades` Collection

A denormalized collection for easy retrieval of a student's or course's grade history.

**Document Structure:**
```json
{
  "id": "string (doc.id)",
  "studentId": "string",
  "courseId": "string",
  "assignmentId": "string",
  "grade": "string",
  "feedback": "string",
  "gradedBy": "string (Tutor's user ID)",
  "date": "string (ISO 8601)"
}
```
---

## Integrity Principles Enforcement

### Entity Integrity
This principle ensures that every entity has a unique identifier.
*   **Enforcement:** In Firestore, every document within a collection automatically has a unique Document ID. We use this ID as the primary key for each entity (`users`, `courses`, `topics`, etc.), guaranteeing uniqueness and fulfilling this principle.

### Referential Integrity
This principle ensures that references between entities are valid.
*   **Enforcement:** Unlike relational databases, Firestore does not enforce referential integrity automatically. We enforce it at the **application layer**:
    *   When linking documents, we store the unique ID of the referenced document (e.g., `course.enrolledStudents` stores an array of `user` IDs).
    *   Our application logic handles these relationships. For example, when displaying course participants, the application fetches the `course` document and then makes subsequent queries to the `users` collection to retrieve the full details for each `userId` in the `enrolledStudents` array.
    *   When deleting an entity (e.g., a user), cleanup logic would be required (typically in a Cloud Function) to remove dangling references, though this is not implemented in the current version.

### Domain Integrity
This principle ensures that all data values in a column (or field) are from a defined set of valid values.
*   **Enforcement:** We enforce this using **TypeScript types** in our application code.
    *   **Example:** The `role` field in a `User` document is defined by the `Role` type, which only allows `"student" | "tutor" | "lecturer" | "admin"`. Any attempt to create or update a user with an invalid role will result in a TypeScript error during development and is rejected by our application logic before it reaches the database.
    *   This strongly-typed approach ensures data consistency and validity across the platform.

