
# CampusLearn - User Task Flows

This document details the step-by-step user interactions for key features within the CampusLearn platform. It demonstrates the intended user experience and decision points.

---

### Task Flow 1: New User Registration

**Goal:** A new user creates an account on the platform.

**Actor:** Prospective Student

1.  **Start:** User lands on the Login page (`/`).
2.  **Action:** Clicks the "Sign up" link.
3.  **Navigate:** System redirects to the Signup page (`/signup`).
4.  **Action:** User fills out the registration form (First Name, Last Name, Email, Password).
5.  **Action:** Clicks the "Create an account" button.
6.  **System Process:**
    -   Firebase Authentication creates a new user record.
    -   A corresponding "user" document is created in the Firestore database with a default `role` of "student" and `status` of "Active".
7.  **Navigate:** System logs the user in and redirects them to their personalized Student Dashboard (`/dashboard`).
8.  **End.**

### Task Flow 2: Assignment Submission & Grading

**Goal:** A student submits an assignment, and a tutor grades it, completing the feedback loop.

**Actors:** Student, Tutor

#### Part A: Student Submission

1.  **Start:** A logged-in Student navigates to the "Assignments" page (`/assignments`).
2.  **Action:** The student locates an "In Progress" assignment and clicks the "Submit" button.
3.  **UI:** A submission dialog appears.
4.  **Action:** The student clicks to upload a file and selects the assignment document from their computer.
5.  **UI:** The filename appears in the dialog, confirming the selection.
6.  **Action:** The student clicks the final "Submit" button inside the dialog.
7.  **System Process:**
    -   The file is uploaded to a secure folder in Firebase Storage.
    -   A `submission` document is created in Firestore, linking the student, assignment, and file URL. The status is set to "Submitted".
8.  **UI:** The student's view updates, showing the assignment status as "Submitted".
9.  **End (Student part).**

#### Part B: Tutor Grading

1.  **Start:** A logged-in Tutor navigates to the "Submissions" page (their view of `/assignments`).
2.  **Action:** The tutor sees the student's recent submission in the "Pending Submissions" table and clicks "Grade".
3.  **UI:** A grading dialog appears, showing the student's name and a link to their submitted file.
4.  **Action:** The tutor opens the file, reviews it, and then enters a grade and detailed feedback into the form fields.
5.  **Action:** The tutor clicks "Submit Grade".
6.  **System Process:**
    -   The `submission` document in Firestore is updated with the grade, feedback, and a new status of "Graded".
    -   A new `grade` document is created for the student's permanent record.
    -   A `notification` document is created for the student.
7.  **UI:** The submission is removed from the tutor's pending list.
8.  **End (Tutor part).**

### Task Flow 3: Creating and Replying to a Help Topic

**Goal:** A student asks a question in the forum, and a tutor provides an answer.

**Actors:** Student, Tutor

1.  **Start:** A logged-in Student navigates to the "Help Topics" page (`/topics`).
2.  **Action:** The student clicks the "Create New Topic" button.
3.  **UI:** A dialog appears for creating a new topic.
4.  **Action:** The student enters a title, a detailed description of their question, and selects the relevant course.
5.  **Action:** The student clicks "Create Topic".
6.  **System Process:**
    -   A new `topic` document is created in Firestore with a status of "Open".
    -   Notifications are sent to tutors assigned to that course.
7.  **Navigate:** The student is taken to the new Topic Detail page (`/topics/[newTopicId]`).
8.  **Action (Tutor):** A Tutor receives a notification and navigates to the topic page.
9.  **Action (Tutor):** The Tutor reads the student's question, types a reply in the text area, and clicks "Send".
10. **System Process:**
    -   The `reply` is added to the `replies` array within the topic document.
    -   A notification is sent to the student and other subscribers of the topic.
11. **UI:** The page updates in real-time to show the new reply in the discussion thread.
12. **End.**

---
### Visual Diagram Prompt

> Create a BPMN (Business Process Model and Notation) diagram for the "Assignment Submission & Grading" process. Define two pools: "Student" and "Tutor". The process should start with the Student.
>
> In the "Student" pool:
> 1.  Start event: "Assignment Due".
> 2.  Task: "View Assignments List".
> 3.  Task: "Select & Upload File".
> 4.  Task: "Submit Assignment".
>
> This should message to the "Tutor" pool.
>
> In the "Tutor" pool:
> 1.  Start event (message-triggered): "Submission Received".
> 2.  Task: "Review Submission".
> 3.  Task: "Enter Grade & Feedback".
> 4.  Task: "Submit Grade".
>
> This should message back to the "Student" pool.
>
> In the "Student" pool:
> 1.  Task: "Receive Grade Notification".
> 2.  Task: "View Grade".
> 3.  End event: "Process Complete".

