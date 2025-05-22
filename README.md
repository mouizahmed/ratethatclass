# RateThatClass | University Course Reviews (IN PROGRESS)

A web application that allows users to create course reviews for their respective post-secondary schools and ease their struggles within the course selection process.

This is a tool that students can use to evaluate courses and find courses that meet their expectations. Each review is categorized by its school, department, course, and professor. If any of these categories are not listed, the user can add them to the database in order to complete their course review.

Each course review is anonymous and can be deleted at any time if the user made the review while signed in. Users can also upvote or downvote other reviews anonymously.

This web application only allows validated post-secondary students to register which is done through verifying emails from a set of whitelisted domains and a confirmation email.

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
