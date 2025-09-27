# ResumeBuddy: AI-Powered Resume Analyzer

ResumeBuddy is a Next.js application that leverages AI to help you analyze and improve your resume based on a target job description. It provides an ATS score, identifies skill gaps, suggests improvements, and generates interview questions, all while securely storing your data in Firebase Firestore.

## Features

- **Resume Upload**: Upload your resume in PDF, DOCX, or TXT format.
- **Job Description Input**: Paste a job description to analyze your resume against.
- **AI-Powered Analysis**: Get an ATS score, keyword analysis, and content coverage percentage.
- **Resume Improvement**: Receive AI-generated suggestions to enhance your resume's content.
- **Q&A Generation**: Generate potential questions and answers based on your resume.
- **Interview Prep**: Get tailored interview questions based on the role and your resume.
- **Secure Authentication**: User authentication with Firebase (Email/Password & Google).
- **Persistent Data**: All user data and analysis results are stored in Cloud Firestore.

## Project Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

- **Node.js**: Version 18.x or later. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Should be installed automatically with Node.js.

### 2. Clone the Repository

Clone this repository to your local machine using your preferred method (HTTPS or SSH).

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 3. Install Dependencies

Install all the required packages using npm.

```bash
npm install
```

### 4. Set Up Environment Variables

You need to connect the application to your own Firebase project.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your project settings, add a new Web App.
3.  Firebase will provide you with a `firebaseConfig` object.
4.  Create a new file named `.env` in the root of your project.
5.  Copy the configuration values into your `.env` file, following the format below:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

6.  In the Firebase Console, go to **Authentication** > **Sign-in method** and enable **Email/Password** and **Google** as sign-in providers.
7.  Go to **Firestore Database** and create a database in production mode.

### 5. Running the Project

Once the setup is complete, you can run the development server.

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.
