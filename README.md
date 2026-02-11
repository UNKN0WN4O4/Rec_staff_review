# Faculty Rating Portal

A web application for students of Rajalakshmi Engineering College to rate and review faculty members.

## Features

-   **Authentication**: Secure login using institutional Google accounts (`@rajalakshmi.edu.in`).
-   **Faculty Listing**: Browse faculty members by department.
-   **Rating System**: Rate faculty on a 5-star scale and provide anonymous feedback.
-   **Real-time Updates**: Powered by Firebase Firestore for instant data synchronization.

## Tech Stack

-   **Frontend**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Backend/Database**: Firebase (Authentication, Firestore)
-   **Deployment**: Firebase Hosting via GitHub Actions

## Local Development

1.  Clone the repository.
2.  Run `npm install`.
3.  Create `.env` file with Firebase config (optional, currently hardcoded in `src/firebase.js`).
4.  Run `npm run dev`.
