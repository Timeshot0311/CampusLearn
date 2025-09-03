
# CampusLearn - UI/UX and Responsive Design Documentation

This document outlines the user interface (UI) and user experience (UX) design principles, identifies key pages for high-fidelity prototypes, and explains the responsive design strategy for the CampusLearn platform.

---

## 1. High-Fidelity Prototypes & Layout Rationale

For high-fidelity prototypes, we can use screenshots of the live application, as it represents the final, polished UI. The following pages are key examples that showcase the platform's core functionality and design philosophy.

### Page 1: Student Dashboard (`/dashboard`)

**Description:** This is the personalized landing page for a student. It provides an at-a-glance overview of their current academic standing and direct access to their most important tasks.

**Layout Rationale:**
*   **Two-Column Grid:** On larger screens, the dashboard uses a two-column grid. The main, wider column on the left contains primary, action-oriented content like "My Courses" and "Upcoming Deadlines". The narrower right-hand column is reserved for secondary, supplementary tools like the "AI Tutoring Assistant" and "Learning Recommendations".
*   **Information Hierarchy:** This layout follows the natural F-shaped reading pattern of users, placing the most critical information where their eyes land first. It ensures that students immediately see their courses and deadlines without being distracted.
*   **Modular Cards:** Content is organized into distinct `Card` components. This modular design makes the information easy to scan and digest. Each card has a clear `CardTitle` and `CardDescription`, immediately informing the user of its purpose.

### Page 2: Course Detail Page (`/courses/[courseId]`)

**Description:** This is where students consume learning materials and where lecturers/tutors manage course content.

**Layout Rationale:**
*   **Master-Detail Interface:** The layout features a persistent "curriculum" list in the left pane (the master view) and a larger content display area on the right (the detail view). This is a classic, highly effective pattern for navigating hierarchical content.
*   **Context and Focus:** Users always maintain context of where they are within the course structure (thanks to the curriculum list) while being able to focus on the specific lesson or task in the main content area.
*   **Tabbed Content Area:** To avoid an overwhelmingly long page, the main content area is organized into tabs: "Lesson Content," "Assignments," and "Participants." This cleanly separates different types of course-related information, allowing users to easily switch between them without losing their place.

### Page 3: Topic Detail Page (`/topics/[topicId]`)

**Description:** This is the forum-style page where students, tutors, and lecturers interact to discuss a specific question or subject.

**Layout Rationale:**
*   **Content and Sidebar Layout:** Similar to the dashboard, this page uses a two-column layout. The main column is dedicated to the dynamic, user-generated discussion thread. The right-hand sidebar contains static, "official" resources like "Learning Materials" and "Quizzes" uploaded by tutors.
*   **Separation of Concerns:** This design choice is critical for usability. It prevents important learning resources from getting lost in a potentially long and active conversation thread. Students can easily reference the official materials while reading or writing replies.
*   **Clear Action Area:** The reply input box is prominently placed at the bottom of the discussion thread, making it intuitive for users to join the conversation.

---

## 2. Responsive Design Strategy

The platform is designed to be fully responsive and mobile-friendly, ensuring a seamless experience across desktops, tablets, and mobile phones. Our strategy is built on a "mobile-first" philosophy using Tailwind CSS.

### Core Principles:

1.  **Mobile-First with Tailwind CSS:** The base styles in our component library are designed for the smallest screens. We then use Tailwind's breakpoint prefixes (e.g., `md:`, `lg:`) to progressively enhance the layout for larger screens. This ensures a fast and functional experience on mobile without having to override complex desktop styles.
2.  **Flexible Grids and Flexbox:** We use CSS Grid (`grid`) and Flexbox (`flex`) extensively to create layouts that naturally adapt. For example, a multi-column layout on a desktop (`lg:grid-cols-3`) will automatically stack into a single vertical column (`grid-cols-1`) on mobile.
3.  **Collapsible Navigation:** The main sidebar navigation (`AppSidebar`) is always visible on desktop for quick access. On mobile, it collapses into a "hamburger" menu icon in the header. When tapped, it opens as a slide-out sheet, preserving valuable screen real estate.
4.  **Adaptive Components:** Individual components are designed to be responsive. For instance:
    *   **Tables:** On mobile, less critical table columns are hidden using the `hidden sm:table-cell` classes to prevent awkward horizontal scrolling.
    *   **Dialogs/Modals:** These components are centered and sized appropriately for all screen sizes, ensuring they are always usable.
    *   **Touch Targets:** Buttons and other interactive elements are sized to be easily tappable on touchscreens.

### Examples of Layout Adaptation:

*   **Student Dashboard:**
    *   **Desktop:** Displays a two-column grid.
    *   **Mobile:** The right-hand column (AI Tutor, Recommendations) stacks vertically below the left-hand column (My Courses, Deadlines), creating a single, scrollable feed.

*   **Course Detail Page:**
    *   **Desktop:** The curriculum and content panes are side-by-side.
    *   **Mobile:** The layout becomes linear. The curriculum accordion list is displayed first, followed by the tabbed content area below it.

*   **Header:**
    *   **Desktop:** The search bar has a defined width, and user menu items are spread out.
    *   **Mobile:** The navigation is collapsed into the `MobileSidebar` trigger, and the search bar takes up more available width to be easily accessible.

    