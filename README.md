<div align="center">
    <img alt="Logo" src="client/public/rtc_logo.png" width="100" />
</div>
<h1 align="center">
    Rate That Class
</h1>

A web application that allows users to anonymously create course reviews for their respective post-secondary schools and ease their struggles within the course selection process.

Try it now: [https://ratethatclass.com/](https://ratethatclass.com/)

# Overview

This is a web application that students can use to evaluate courses and find courses that meet their expectations. Each review is categorized by its school, department, course, and professor. If any of these categories are not listed, the user can add them to the database in order to complete their course review.

Each course review is anonymous and can be deleted at any time if the user made the review while signed in. Users can also upvote or downvote other reviews anonymously.

This web application only allows validated post-secondary students to register which is done through verifying emails from a set of whitelisted domains and a confirmation email.

![Home Page](docs/home_page.png)

# Features

- 🎓 **Anonymous Course Reviews**: Create detailed, anonymous reviews for courses at your post-secondary institution
- 👤 **Flexible Account Options**: Create an account with any email or remain anonymous
- ✅ **Student Verification**: Optional verification for students to get a verified student badge on their reviews
- 📊 **4-Point Rating System**: Rate courses on Overall Quality, Easiness, Interest Level, and Usefulness (1-5 scale)
- 💬 **Detailed Reviews**: Share insights about course content, professors, and advice for future students, plus include grade, workload, textbook usage, and evaluation methods
- 🏫 **University-Organized & Smart Filtering**: Browse reviews by university, department, course, and professor with filtering by term, delivery method, and sorting options
- 🔄 **Automated Course Data**: Comprehensive course catalog with automatically scraped and updated course information from major Canadian universities
- 👮 **Admin Dashboard**: Robust moderation system with report management, user banning, and admin account management
- 🗳️ **Community Voting**: Upvote and downvote reviews to highlight the most helpful content
- 📱 **Mobile-Friendly**: Works seamlessly on desktop and mobile devices
- 👤 **Review Management**: View and manage your own reviews from your profile
- 🚨 **Report System**: Report inappropriate content to maintain community standards
- 🔍 **SEO Optimized**: Google SEO optimized with Server-Side Rendering (SSR) and dynamic sitemap generation

# Usage Flow

1. **Create Account**: Sign up with any email or remain anonymous
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
│   │   │   ├── adsense/   # Google AdSense components
│   │   │   ├── auth/      # Authentication forms
│   │   │   ├── common/    # Shared components
│   │   │   ├── dialogs/   # Modal and dialog components
│   │   │   ├── display/   # Data display components
│   │   │   ├── forms/     # Form components and steps
│   │   │   └── ui/        # Base UI components (shadcn/ui)
│   │   ├── contexts/      # React context providers
│   │   ├── firebase/      # Firebase client configuration
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and constants
│   │   ├── requests/      # API request functions
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   ├── .next/             # Next.js build output
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── components.json    # shadcn/ui components configuration
│   └── package.json
├── server/                # Express.js backend API server
│   ├── src/
│   │   ├── routes/        # API endpoint route definitions
│   │   ├── controllers/   # Request handlers and business logic
│   │   ├── services/      # Business logic and data processing
│   │   ├── repositories/  # Database access layer
│   │   ├── validators/    # Request validation schemas
│   │   ├── db/           # Database connection and configuration
│   │   ├── helpers.ts    # Utility functions
│   │   ├── types.ts
│   │   └── index.ts      # Express server entry point
│   ├── middleware/        # Authentication middleware
│   ├── firebase/          # Firebase admin configuration
│   └── package.json
├── init-db/
│   └── init-db.sql        # Database schema and initial data for Docker
├── scraper/               # University data collection tools
│   ├── scrapers/          # Individual university scrapers
│   │   ├── base_scraper.py    # Base scraper class
│   │   └── *_scraper.py       # University-specific scrapers
│   ├── scraped_data/      # Storage for scraped university data
│   │   └── *_data.json        # University-specific scraped data
│   ├── logs/              # Scraper execution logs
│   │   └── scraper_YYYYMMDD_HHMMSS.log  # e.g. scraper_20250604_200750.log
│   ├── database.py        # Database operations and models
│   ├── logger.py          # Logging configuration
│   ├── utils.py           # Shared utility functions
│   └── main.py           # Scraper CLI entrypoint
├── docker-compose.yml     # Multi-container Docker setup
└── README.md              # Project documentation
```

# Tech Stack

## Frontend

- **Framework**: Next.js 15.1.3 (React)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth
- **Language**: TypeScript

## Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: Firebase Admin SDK
- **Language**: TypeScript

## Scraper

- **Language**: Python
- **Web Scraping**: Selenium WebDriver + BeautifulSoup4
- **Data Storage**: JSON + PostgreSQL with ThreadedConnectionPool
- **Logging**: Thread-safe Python Logger with context-managed locks
- **Browser Automation**: Chrome WebDriver
- **Concurrency**: Multi-threading with ThreadPoolExecutor + Lock-based synchronization

## Infrastructure

- **Frontend Hosting**: [Vercel](https://vercel.com/)
- **Backend Hosting**: [Render](https://render.com/)
- **Database Hosting**: [Supabase](https://supabase.com/)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Containerization**: [Docker](https://www.docker.com/)

# Getting Started

This application is designed to run with Firebase and cannot be run locally due to Firebase auth dependencies.

## Prerequisites

- Running Docker Daemon
- Firebase Project with auth enabled

## Installing

1. If you don't have docker, you can find the installation instructions [here](https://docs.docker.com/get-started/get-docker/)

2. Install the project by cloning this repository: `git clone git@github.com:mouizahmed/ratethatclass.git`

3. Configure Firebase:

   **Client-side Configuration (Frontend):**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication in your Firebase project
   - Go to Project Settings > General and copy your web app configuration
   - In `docker-compose.yml`, replace the client Firebase environment variables:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

   **Server-side Configuration (Firebase Admin SDK):**

   - Go to Project Settings > Service Accounts
   - Click "Generate new private key" to download a JSON file
   - Extract the following values from the JSON file and add them to `docker-compose.yml`:
     - `CLIENT_EMAIL` (from `client_email`)
     - `CLIENT_ID` (from `client_id`)
     - `CLIENT_X509_CERT_URL` (from `client_x509_cert_url`)
     - `PRIVATE_KEY` (from `private_key` - keep the quotes and newlines)
     - `PRIVATE_KEY_ID` (from `private_key_id`)
     - `PROJECT_ID` (from `project_id`)

4. Start the application:

   ```bash
   # Build the containers first
   docker-compose build

   # Start the application
   docker-compose up -d
   ```

## Scraper Usage

The scraper can be built and run using Docker. Here are the available commands:

### Required Environment Variables

The scraper requires the following environment variables to be set in a `.env` file:

```
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

These variables must be set with your database connection details for the scraper to function correctly.

**Note:** If you are running the scraper as part of the full application stack using `docker-compose` (i.e., alongside the database and other services), ensure that the environment variable values for the scraper match those defined in the `database` service configuration in your `docker-compose.yml`. This ensures the scraper can connect to the correct database instance within the Docker network.

For example, if your `docker-compose.yml` database service is configured as follows:

```yaml
db:
  image: postgres:15
  environment:
    POSTGRES_DB: ratethatclass
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  ports:
    - '5432:5432'
```

Then your scraper environment variables should be:

```
DB_NAME=ratethatclass
DB_USER=postgres
DB_PASS=postgres
DB_HOST=postgres
DB_PORT=5432
```

1. Build the scraper:

   ```bash
   docker build -t course-reviews-scraper ./scraper
   ```

2. Run the scraper with different commands:

   ```bash
   # Scrape and store data in database
   docker run -v ${PWD}/scraped_data:/app/scraped_data -v ${PWD}/logs:/app/logs --env-file .env course-reviews-scraper scrape-and-store

   # Scrape only (saves to JSON files)
   docker run -v ${PWD}/scraped_data:/app/scraped_data -v ${PWD}/logs:/app/logs --env-file .env course-reviews-scraper scrape-only

   # Import existing JSON files into database
   docker run -v ${PWD}/scraped_data:/app/scraped_data -v ${PWD}/logs:/app/logs --env-file .env course-reviews-scraper store-json
   ```

   Note: Make sure you have a `.env` file in your scraper directory with the necessary database credentials.

# License

[AGPL](https://github.com/mouizahmed/ratethatclass/blob/master/LICENSE)
