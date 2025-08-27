# **App Name**: CampusLearn

## Core Features:

- RBAC Implementation: Implement a system for managing user roles (Student, Tutor, Admin) and permissions. UI updates depending on role.
- Course Content Display: Display dynamic course overviews including topics and learning materials based on role.
- Assignment and Grade Management: Support submission of assignments, display grades, and receive feedback, role dependent
- AI-Powered Learning Recommendations: Generate personalized learning path suggestions for student roles based on modules, the content the student has used, and course objectives; use reasoning to incorporate relevant courses or content in recommendations (tool).
- Static Content Hosting: User and course content hosting
- Mobile notifications: Users receive mobile notifications on their enrolled devices.
- Responsive Layout: Ensure content is easily accessible on a variety of devices.
- User Authentication: User Authentication flows (sign up, sign in, password reset, verification).
- Enrollment Management: Enrolment management (students enrolling in courses or via codes, preventing duplicates).
- Quizzes and Automated Grading: Quizzes & automated grading (MCQs, timers, auto-marking).
- Discussion Forums: Discussion/QA forums (threaded, moderated, with resolve/soft delete).
- Search and Filtering: Search & filtering (courses, topics, tutors, deadlines).
- Progress Tracking Dashboards: Progress tracking dashboards (percentages, upcoming deadlines).
- Analytics: Analytics for tutors/admins (enrollment rates, completion, scores).
- Audit Trail and Activity Logs: Audit trail & activity logs (immutable logs of submissions, grades, enrolments).
- Announcements: Announcements (course/topic-wide push messages).
- File Uploads: File uploads (assignments, learning materials, avatars, multimedia).
- Calendar and Scheduling: Calendar / scheduling (optional: due dates, reminders).
- Offline/PWA Mode: Offline/PWA mode (cache lessons for read-only access).
- Data Integrity & Consistency: Enforce one enrolment per user-course pair, immutable grades, audit trail for edits.
- Compliance & Privacy: GDPR/POPIA compliance, strict RBAC, encrypted data in transit & at rest.
- Extensibility (Certificates & API Hooks): Optional features like auto-generated completion certificates and plagiarism check integrations.
- AI Tutoring Assistant: A chatbot that answers student questions using course materials.
- Smart Quiz Generation: Auto-generate practice quizzes from uploaded learning materials (PDFs, notes).
- Automated Summarization: Summarize long lecture notes or videos into concise study guides.
- Plagiarism & Similarity Detection: Run AI-powered checks on student submissions.
- Adaptive Difficulty Tracking: Adjusts quiz difficulty based on past student performance.
- Engagement Insights: AI analyzes discussion activity, resource usage, quiz attempts.
- AI-Powered Feedback Generator: Drafts personalized feedback on assignments (tutor reviews before sending).
- Predictive Analytics (Dropout Risk): Detects patterns of inactivity, low grades, or missed deadlines.

## Style Guidelines:

- Keep purple/green, but add a softer neutral blue or grey for body backgrounds / inactive states.
- Inter (body) + Space Grotesk (headers) → keep, but use different weights for hierarchy.
- Adopt a card-based design (topics, assignments, resources all in modular cards).
- Add education-specific line icons (book, quiz, assignment, grade).
- Subtle hover states (button color shift, card shadow lift).
- Smooth transitions for navigation between pages/panels.
- Animated progress bars for student dashboards (completion %).
- Notification badge animations (bounce/pulse) for new alerts.
- Follow WCAG 2.1 AA guidelines: sufficient color contrast, keyboard navigation, ARIA labels.
- Provide a dark mode toggle for accessibility and comfort.
- Ensure mobile interactions are touch-friendly (buttons ≥44px).