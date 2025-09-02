
# CampusLearn - Application Sitemap

This document outlines the sitemap for the CampusLearn platform. The application's structure is role-based, meaning the navigation and accessible pages change depending on whether the user is a Student, Tutor, Lecturer, or Admin.

---

## Sitemap Structure

### 1. Public Routes (Unauthenticated Users)

These pages are accessible to anyone visiting the site.

- **`/` (Login Page)**: The main entry point for existing users.
- **`/signup` (Signup Page)**: The entry point for new users to create an account.

### 2. Authenticated Routes (All Roles)

Once logged in, all users have access to a core set of features.

- **/dashboard**: The user's personalized landing page. Content varies based on role.
- **/courses**: A gallery of courses.
  - For Students: Shows enrolled courses.
  - For Tutors/Lecturers/Admins: Shows all courses they are assigned to or have created.
  - **`/courses/[courseId]`**: The detailed view of a single course, including its modules and lessons.
- **/topics**: The main page for the forum-style help topics.
  - **`/topics/[topicId]`**: The detailed view of a single topic, including its discussion thread and materials.
- **/profile**: The user's own editable profile page.
- **/profile/[userId]**: A public, read-only view of another user's profile.

### 3. Role-Specific Routes

These routes are tailored to the specific functions of each role.

#### Student

- **/assignments**: View assignments for all enrolled courses and submit work.
- **/grades**: View grades and feedback from tutors.

#### Tutor / Lecturer

- **/assignments**: View and grade student submissions for assigned courses.
- **/grades**: View the gradebook for all assigned courses.
- **/analytics**: View analytics on course popularity and student engagement.

#### Admin

- **/users**: A comprehensive dashboard to manage all user accounts on the platform.
- **/analytics**: View system-wide analytics, including user growth and platform activity.

---

### Visual Diagram Prompt

You can use this prompt with a diagram-generation tool (like ChatGPT with Mermaid.js) to create a visual sitemap.

> Create a visual sitemap diagram using Mermaid.js `graph TD` syntax. The root is "CampusLearn App".
>
> Create a "Public" node branching from the root, leading to "Login (`/`)" and "Signup (`/signup`)".
>
> Create an "Authenticated" node branching from the root. From "Authenticated", create four role nodes: "Student", "Tutor", "Lecturer", and "Admin".
>
> Create shared page nodes: "Dashboard (`/dashboard`)", "Courses (`/courses`)", "Topics (`/topics`)", and "Profile (`/profile`)".
>
> Draw links from all four role nodes to these shared page nodes.
>
> Create role-specific page nodes:
> - "My Assignments (`/assignments`)" and "My Grades (`/grades`)" -> Link only from "Student".
> - "Submissions (`/assignments`)" and "Gradebook (`/grades`)" -> Link from "Tutor" and "Lecturer".
> - "Analytics (`/analytics`)" -> Link from "Tutor", "Lecturer", and "Admin".
> - "User Management (`/users`)" -> Link only from "Admin".
>
> Show that "Courses" leads to "Course Detail (`/courses/[id]`)", and "Topics" leads to "Topic Detail (`/topics/[id]`)".

