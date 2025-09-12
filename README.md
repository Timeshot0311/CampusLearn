
<div align="center">
  <img src="/public/logo.png" alt="CampusLearn Logo" width="128"/>
  <h1 align="center">CampusLearn</h1>
  <p align="center">
    The modern, AI-powered Learning Management System for the next generation of education.
  </p>
</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Cypress](https://img.shields.io/badge/Cypress-E2E_Tests-darkgreen?style=for-the-badge&logo=cypress)](https://www.cypress.io/)
[![Jest](https://img.shields.io/badge/Jest-Unit_Tests-red?style=for-the-badge&logo=jest)](https://jestjs.io/)

</div>

---

**CampusLearn** is a feature-rich, full-stack learning management platform designed to provide a seamless and interactive educational experience. Built with a modern technology stack, it empowers students, tutors, lecturers, and administrators with the tools they need to succeed in a digital-first academic environment. From AI-powered tutoring to a fully integrated assignment and grading workflow, CampusLearn is the all-in-one solution for modern learning.

## ✨ Key Features

- **Role-Based Dashboards:** Personalized landing pages for Students, Tutors, Lecturers, and Admins.
- **Comprehensive Course Management:** Create and manage courses with modular content, including articles, videos, and file uploads.
- **Interactive Learning:** Engage with course material, track progress, and consume various content types.
- **Assignment & Grading Workflow:** A complete end-to-end system for submitting, tracking, and grading assignments.
- **AI-Powered Assistance:**
  - **AI Tutoring Assistant:** Get instant help and answers to questions based on course-specific content.
  - **Smart Quiz Generation:** Tutors and lecturers can automatically generate practice quizzes from learning materials.
  - **AI Feedback Generation:** Draft personalized, constructive feedback for student submissions instantly.
- **Forum-Style Help Topics:** A centralized place for students to ask questions and for instructors to provide answers and supplementary materials.
- **User Profiles & Subscriptions:** Follow other users to stay updated on their created topics and activities.
- **System-Wide Analytics:** Visual charts and dashboards for tracking course popularity, student engagement, and platform usage.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Services:** [Firebase](https://firebase.google.com/)
  - **Hosting:** Firebase App Hosting
  - **Authentication:** Firebase Authentication
  - **Database:** Cloud Firestore
  - **Storage:** Cloud Storage for Firebase
- **Generative AI:** [Google's Genkit](https://firebase.google.com/docs/genkit) framework with the Gemini model family.
- **UI Components & Styling:** [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Testing:**
  - **End-to-End:** [Cypress](https://www.cypress.io/)
  - **Unit/Integration:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

---

## 🏁 Getting Started

Follow these instructions to get a local copy of CampusLearn up and running for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- An active [Firebase](https://firebase.google.com/) project.

### 1. Installation

Clone the repository and install the dependencies.

```bash
git clone <repository-url>
cd campus-learn
npm install
```

### 2. Environment Setup

The application requires Firebase credentials to connect to the backend.

1.  **Create a `.env` file** in the root of the project.
2.  Navigate to your Firebase project, go to **Project Settings**, and under the "General" tab, find your "SDK setup and configuration".
3.  Copy the values from the `firebaseConfig` object into your `.env` file like so:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...:web:...
```

### 3. Running the Application

Once your environment variables are set, you can start the development server.

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

---

## 🧪 Testing

The CampusLearn platform includes a comprehensive suite of tests to ensure reliability and code quality.

### Unit & Integration Tests

Jest is used for unit and integration testing of our backend services. These tests verify the internal logic of functions that interact with the database.

```bash
# Run all unit tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### End-to-End (E2E) UI Tests

Cypress is used for E2E testing, which simulates real user flows in a browser.

1.  **Set up Test Credentials:**
    -   Open the `cypress.env.json` file.
    -   Update the `CYPRESS_TEST_USER_EMAIL` and `CYPRESS_TEST_USER_PASSWORD` with the credentials of a test user in your Firebase project (e.g., the `student@campus.com` user).

2.  **Run the Tests:**
    -   To open the interactive Cypress Test Runner and watch tests execute live in a Chrome browser, run:
        ```bash
        npm run test:e2e:open
        ```
    -   To run all tests headlessly in the terminal (ideal for CI/CD), run:
        ```bash
        npm run test:e2e
        ```

---

## 🚀 Deployment

This application is configured for seamless, zero-downtime deployment using **Firebase App Hosting**. The deployment strategy is based on a Git-based workflow. Pushing code to the main branch will automatically trigger a build and deploy the new version to the live environment. For more details, see the `apphosting.yaml` file.
