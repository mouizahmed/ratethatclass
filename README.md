# Rate That Class

A web application that allows users to anonymously create course reviews for their respective post-secondary schools and ease their struggles within the course selection process.

Try it now: [https://ratethatclass.com/](https://ratethatclass.com/)

# Overview

This is a web application that students can use to evaluate courses and find courses that meet their expectations. Each review is categorized by its school, department, course, and professor. If any of these categories are not listed, the user can add them to the database in order to complete their course review.

Each course review is anonymous and can be deleted at any time if the user made the review while signed in. Users can also upvote or downvote other reviews anonymously.

This web application only allows validated post-secondary students to register which is done through verifying emails from a set of whitelisted domains and a confirmation email.

# Features

- 🎓 **Anonymous Course Reviews**: Create detailed, anonymous reviews for courses at your post-secondary institution
- 📊 **4-Point Rating System**: Rate courses on Overall Quality, Easiness, Interest Level, and Usefulness (1-5 scale)
- 🏫 **University-Organized & Smart Filtering**: Browse reviews by university, department, course, and professor with filtering by term, delivery method, and sorting options
- 🔐 **Verified Students Only**: Email domain verification ensures only legitimate post-secondary students can join
- 🗳️ **Community Voting**: Upvote and downvote reviews to highlight the most helpful content
- 📱 **Mobile-Friendly**: Works seamlessly on desktop and mobile devices
- 💬 **Detailed Reviews**: Share insights about course content, professors, and advice for future students, plus include grade, workload, textbook usage, and evaluation methods
- 👤 **Review Management**: View and manage your own reviews from your profile
- 🚨 **Report System**: Report inappropriate content to maintain community standards
- 📈 **Live Statistics**: Real-time course ratings and review counts

# Usage Flow

1. **Register & Verify**: Sign up with your university email and verify your account
2. **Browse Universities**: Select your post-secondary institution from the list
3. **Explore Departments**: Navigate to your department and find your course
4. **Read Reviews**: View existing reviews with ratings, comments, and filtering options
5. **Create Review**: Add your own anonymous review with ratings and detailed feedback
   - Rate the course on 4 dimensions (Overall, Easiness, Interest, Usefulness)
   - Enter course details (professor, grade, delivery method, workload, textbook usage)
   - Write comments about course content, professor, and advice for future students
   - Review and confirm your submission
6. **Engage Community**: Vote on helpful reviews and manage your contributions
7. **Discover Courses**: Use insights to make informed decisions about future course selections

# Project Structure

```
rate-that-class/
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # Reusable UI components
│   │   │   ├── auth/      # Authentication forms
│   │   │   ├── common/    # Shared components
│   │   │   ├── display/   # Data display components
│   │   │   ├── forms/     # Form components and steps
│   │   │   └── ui/        # Base UI components (shadcn/ui)
│   │   ├── contexts/      # React context providers
│   │   ├── firebase/      # Firebase client configuration
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and constants
│   │   ├── requests/      # API request functions
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets (images, icons)
│   └── package.json       # Frontend dependencies
├── server/                # Express.js backend API
│   ├── src/
│   │   ├── routes/        # API endpoint handlers
│   │   │   ├── course.ts      # Course-related endpoints
│   │   │   ├── review.ts      # Review CRUD and voting
│   │   │   ├── user.ts        # User management
│   │   │   ├── university.ts  # University data
│   │   │   ├── department.ts  # Department endpoints
│   │   │   ├── professor.ts   # Professor management
│   │   │   └── report.ts      # Content reporting
│   │   ├── db/            # Database queries and connection
│   │   ├── types.ts       # Backend type definitions
│   │   └── index.ts       # Express server entry point
│   ├── middleware/        # Authentication middleware
│   ├── firebase/          # Firebase admin configuration
│   └── package.json       # Backend dependencies
├── init-db/               # PostgreSQL database setup
│   └── init-db.sql        # Database schema and initial data
├── scraper/               # University data collection tools
├── docker-compose.yml     # Multi-container Docker setup
└── README.md              # Project documentation
```

# Tools & Frameworks

Database: PostgreSQL

Front-End: NextJS (ReactJS)

CSS/Styling: Tailwind + shadcn/ui

Backend: NodeJS, ExpressJS

Images: [Cloudinary](https://cloudinary.com/)

# Deployment

[Vercel](https://vercel.com/) to host the front-end.

[Render](https://render.com/) to host the back-end.

[Supabase](https://supabase.com/) to host the PostgreSQL database.

# Live Service

[https://ratethatclass.com/](https://ratethatclass.com/)

# How to run locally

## Prerequisites

- Running Docker Daemon
- Firebase Project

## Installing

1. If you don't have docker, you can find the installation instructions [here](https://docs.docker.com/get-started/get-docker/)

2. Install the project by cloning this repository: `git clone git@github.com:mouizahmed/ratethatclass.git`

3. Set up Firebase:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication in your Firebase project
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Create a new web app if you haven't already
   - Copy the Firebase configuration values

4. Create a `.env` file in the root directory with the following variables:

   ```
   # Database Configuration
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=ratethatclass

   # Firebase Configuration
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id

   # Node Environment
   NODE_ENV=development
   ```

5. Start the application:
   ```bash
   docker-compose up -d
   ```
