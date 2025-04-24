# RateThatClass | University Course Reviews

A web application that allows users to create course reviews for their respective post-secondary schools and ease their struggles within the course selection process.

This is a tool that students can use to evaluate courses and find courses that meet their expectations. Each review is categorized by its school, department, course, and professor. If any of these categories are not listed, the user can add them to the database in order to complete their course review.

Each course review is anonymous and can be deleted at any time if the user made the review while signed in. Users can also upvote or downvote other reviews anonymously.

This web application only allows validated post-secondary students to register which is done through verifying emails from a set of whitelisted domains and a confirmation email.

# Tools & Frameworks

Database: PostgreSQL

Front-End: NextJS

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
- PostgreSQL Database

## Installing

- If you don't have docker, you can find the installation instructions [here]()
- Install the project by cloning this repository: ` git clone git@github.com:mouizahmed/ratethatclass.git`

# Bugs & Fixes

- First request to the backend and database were extremely slow (only present during initial load of website).
  - This has been fixed by switching from Render to Vercel to host the back-end. (Render.com shuts down the server after inactivity, making the first request take significantly longer) :heavy_check_mark:
- Currently shut down MySQL database hosting on Google Cloud Platform due to accruing charges. Will find another hosting platform with minimal costs.
  - This has been fixed by switching to PlanetScale's NoSQL Database (Serverless). :heavy_check_mark:
- Database loading is extremely slow (using PlanetScale NoSQL Database) :x:
  - PlanetScale Database may idle (go to sleep) if inactive for a while. :x:
