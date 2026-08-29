# Project Knowledge

## Overview
This is a high-performance **Next.js 15 (App Router)** developer portfolio for Shubham, a Full Stack Software Developer specializing in Java, Spring Boot, PostgreSQL, Angular, React, and Cloud technologies.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Static Site Generation)
- **UI & Styling:** React 19, Tailwind CSS 3 (Monochrome White & Black aesthetic)
- **Icons & Animation:** Lucide React, Framer Motion
- **Database Engine:** PostgreSQL (Hosted on Neon Tech Cloud) & MongoDB (Mongoose)
- **Database GUI Tool:** pgAdmin 4 / DBeaver / Neon Console (for viewing/editing PostgreSQL data)

## Design System: Monochrome White & Black (Luxury Tech)
- **Background:** `#000000` (Pure Pitch Black) and `#09090b` (Deep Zinc)
- **Surfaces/Cards:** `#121215` / `#18181b` with subtle white hairline borders (`rgba(255, 255, 255, 0.1)`)
- **Primary Typography:** `#ffffff` (Pure White)
- **Secondary Typography:** `#a1a1aa` (Zinc 400), `#d4d4d8` (Zinc 300)
- **Buttons:** Solid white primary buttons with black text, hover inversion, and subtle white glow shadows
- **Patterns:** Aceternity UI-style background grid (`bg-grid-white`) with radial vignette mask

## Database Architecture: pgsql (PostgreSQL) vs. pgAdmin
- **PostgreSQL (`pgsql`)**: The actual database server & relational storage engine.
  - Table `portfolio_contacts`: Stores contact inquiries (`id`, `name`, `email`, `phone`, `subject`, `message`, `created_at`).
- **pgAdmin**: The GUI administrative software used by the developer to connect to PostgreSQL, inspect tables, run SQL queries, and edit records manually.

## Contact Form & Email Integration
- Route Handler: `src/app/api/contact/route.ts`
- When submitted:
  1. Inserts into Neon PostgreSQL (`portfolio_contacts`).
  2. Dispatches structured email notification to `shubhammisra800@gmail.com` via FormSubmit with 1-click reply.
  3. Optionally syncs to MongoDB.
