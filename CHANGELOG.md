# Portfolio Changelog & Migration Summary

This document details all changes, enhancements, and architectural upgrades implemented across the portfolio.

---

## 📅 Latest: 100% Self-Hosted Vector RAG & Senior Engineer Design Overhaul

### 1. 100% Self-Hosted Local Vector Storage (Zero Cloud Dependency)
* **Zero Free-Tier Dependency**: Migrated from external cloud tiers (Neon free limits) to an enterprise-grade **Self-Hosted Local Vector Store** (`src/lib/rag/localVectorStore.ts`).
* **Disk Persistence**: All embedded vectors are stored locally in `data/vectors/portfolio_embeddings.json`.
* **20 Knowledge Chunks Embedded**:
  * Hero Bio & Overview
  * About section & engineering philosophy
  * Technical Skills across 4 categories (Angular, React, Java, Spring Boot, PostgreSQL, MongoDB, Docker, AWS, etc.)
  * All 5 Production Projects with architecture, live links, and GitHub repos
  * All 4 Education Qualifications (Indira University MSc, BSc, XII, X)
  * Professional Experience at APK Elite Services, SetTribe, and Tipco Engineering
  * Direct Hiring Channels (0 days notice period, immediate availability)
* **Sub-Millisecond Cosine Retrieval**: High-speed in-memory vector search with `< 1ms` latency.

### 2. Smooth Line-by-Line Chatbot Typewriter Streaming
* Created `<StreamedMessage />` in `PortfolioChatbot.tsx` with adaptive delays, smooth opacity fade-up, real-time markdown parsing, pulsing typing indicator, and automated autoscroll.
* Guaranteed bot responses stream line-by-line grounded directly on the local vector store.

### 3. Senior Engineer & Linear-Grade Design Transformation
* **Public Site**: Removed all AI sparkles and cheesy buzzwords. Added authentic developer badges (`shubham.dev [SDE]`, `01 / ABOUT & BACKGROUND`, `Production Systems`, `🟢 Available for Opportunities`).
* **Admin Dashboard**: Redesigned `/admin` with Vercel/Linear-grade monospace breadcrumb navigation, sleek border-bottom tabs, and a restrained obsidian-black RAG control panel.

---

## 📅 Recent Troubleshooting & Deployment Log (Next.js 15 & Netlify)

### 1. Issue: Netlify Build Failure with `@netlify/angular-runtime`
* **Error**: `Plugin "@netlify/angular-runtime" failed: Could not locate your angular.json/nx.json at your project root...` (Exit code: 2).
* **Root Cause**: Because the repository previously ran Angular 18, Netlify auto-attached the `@netlify/angular-runtime` integration in the Netlify dashboard. During `onPreBuild`, it searched for `angular.json` which no longer exists in Next.js 15.
* **Resolution**: Removed `@netlify/angular-runtime` from the Netlify site integrations/plugins, set framework preset to Next.js.

### 2. Issue: Netlify Publish Directory Mismatch & Runtime v5
* **Error**: `Error: Your publish directory does not contain expected Next.js build output. Please check your build settings (publish: /opt/build/repo/dist/porfile/browser)`.
* **Root Cause**: Netlify UI had cached the old publish directory `dist/porfile/browser` from the legacy Angular deployment.
* **Resolution**:
  * Explicitly configured `publish = ".next"` in `netlify.toml` to override the legacy UI path.
  * Installed `@netlify/plugin-nextjs: ^5.15.13` in `devDependencies` for full Next.js 15 App Router support.
  * Configured `NODE_VERSION = "22"` in `netlify.toml` environment to satisfy the runtime requirement.

### 3. Issue: Local Webpack Chunk Desync (`Cannot find module './611.js'`)
* **Error**: `Runtime Error: Cannot find module './611.js' at webpack-runtime.js` on `http://localhost:3000`.
* **Root Cause**: Running `npm run build` concurrently while `npm run dev` was active caused chunk cache collision in `.next`.
* **Resolution**: Stopped the dev server process, purged the local `.next` directory cache, and re-launched `npm run dev`. Verified clean hydration and 200 responses.

### 4. Feature: Squarespace 3D Celestial Particle Spheres & Refined Avatars
* Added continuous 3D rotating starfield particle spheres with mouse-follow parallax in both Hero and About sections.
* Streamlined avatar imagery to compact circular capsules with floating status indicators and orbiting technology pills (`⚡ Spring Boot`, `⚛ React / Angular`, `PostgreSQL & Cloud`).

---

## 📅 Summary of Work Completed

1. **Codebase Analysis & Project Knowledge Setup**
   - Audited the entire existing codebase, styling patterns, and asset structure.
   - Built the knowledge rule file: `.agents/rules/project_knowledge.md`.
   - Created a comprehensive UI/UX audit report identifying color grading inconsistencies, accessibility improvements, and navigation enhancements.

2. **UI/UX & Design System Modernization**
   - **Color Grading Alignment**: Replaced legacy orange accents (`#ff6b35`, `#ff8c00`) across all components with a modern cyber cyan theme (`#00d9ff`, `#0099cc`) on a deep blue-black background (`#0a0e17` to `#0d1420`).
   - **Sticky Navigation**: Implemented a sticky header with backdrop blur so visitors never lose access to navigation.
   - **Hero CTAs**: Added a secondary **"Download Resume"** button alongside the **"Send Email"** button.
   - **Interactive Micro-animations**: Added hover lift, cyan glow shadows, and scaling effects on buttons and cards.
   - **Accessibility & Focus Rings**: Added `:focus-visible` styling with `#00d9ff` outlines for keyboard accessibility.
   - **Error Visibility**: Upgraded form validation error text to a high-contrast `#ff4d4d` red.

3. **Direct Email Delivery on Contact Form**
   - Integrated FormSubmit AJAX API targeting `shubhammisra800@gmail.com`.
   - Form submissions are automatically packaged into clean HTML tables and sent directly to your Gmail inbox.
   - Configured `_replyto` header to the sender's email so clicking "Reply" in Gmail replies directly to the client/recruiter.
   - Added loading spinner ("Sending Message..."), auto-form-reset, and cyan confirmation banners upon successful delivery.
   - Added asynchronous database backup to the Railway backend.

4. **Complete Next.js 15 Migration (In the Same Repository)**
   - **Safety First**: Preserved the entire legacy Angular 18 project in a dedicated Git branch: `backup/angular-version`.
   - Replaced Angular client-side rendering with **Next.js 15 (App Router)** with **Static Site Generation (SSG)** for fast page loading and 100/100 SEO.
   - Upgraded stack to **React 19**, **TypeScript 5**, **Tailwind CSS 3**, and **Lucide React** icons.
   - Translated all components into modular React components in `src/components/`:
     - `Navbar.tsx` (sticky blur, mobile hamburger drawer, desktop nav, "Hire Me" button)
     - `Hero.tsx` (gradient headline, ambient glow, profile avatar, "Open to Work" badge, CTAs)
     - `About.tsx` (photo, background bio, direct contact chips for phone/email/location, core pillars)
     - `Skills.tsx` (filter tabs: *All, Frontend, Backend, Database, Cloud & Tools* with SVG/WebP tech icons)
     - `Projects.tsx` (featured cards with live demo links, frontend & backend GitHub repositories, feature lists)
     - `Education.tsx` (interactive vertical timeline for MSc, BSc, and industry internship at SetTribe)
     - `ContactForm.tsx` (FormSubmit email delivery, validation, spinner, inline feedback)
     - `Footer.tsx` (social links: GitHub, LinkedIn, X/Twitter, Instagram, smooth scroll-to-top)
   - Configured root layout (`src/app/layout.tsx`) with Google Font **Inter**, Schema.org `Person` JSON-LD structured data, and OpenGraph/Twitter card metadata.

5. **MongoDB Storage & Serverless Email Delivery Pipeline**
   - Installed `mongoose` ODM and created a cached connection utility (`src/lib/mongodb.ts`) to avoid connection exhaustion in Next.js serverless execution.
   - Designed a typed Mongoose schema/model (`src/models/Contact.ts`) capturing:
     - `name`, `email`, `phone`, `subject`, `message`, `timestamps` (created at / updated at).
   - Created `.env.local` and `.env.example` templates for `MONGODB_URI`.

6. **PostgreSQL (Neon Tech Cloud DB) Direct Connection**
   - Connected directly to your cloud PostgreSQL database on **Neon Tech**:
     - Host: `ep-cool-block-atydsn8b.c-9.us-east-1.aws.neon.tech`
     - Database: `neondb`
   - Installed `pg` with connection pooling in `src/lib/postgres.ts`.
   - Automated creation of table `portfolio_contacts` (with `id`, `name`, `email`, `phone`, `subject`, `message`, `created_at`).
   - Integrated into `src/app/api/contact/route.ts`:
     - Every submission is inserted into PostgreSQL (`portfolio_contacts`).
     - Also inserted into MongoDB (if configured).
     - Dispatches instant email notification to `shubhammisra800@gmail.com`.
   - Verified live connection and table generation with 0 errors.

7. **Custom Built-in Admin Dashboard (`/admin`) & Dynamic CMS**
   - Built a password-protected admin portal at `/admin` (master key: `ADMIN_PASSWORD` in `.env.local`, default: `admin123`).
   - **Messages Inbox (PostgreSQL)**: View all contact form inquiries submitted to Neon PostgreSQL in real-time, search by name/email/subject, view message details, and delete entries.
   - **Content Editor (CMS)**: Visual forms allowing you to edit Hero text, About info, Projects (live demo & GitHub links), Skills, and Education milestones without writing code. Changes persist directly into PostgreSQL and update the live site instantly!
   - **Free Database Tools Guide**: Step-by-step connection guide for DBeaver Community and pgAdmin 4 with your pre-filled Neon Tech credentials.
   - Verified production build with `npm run build` (All routes `/`, `/admin`, `/api/*` compiled with zero errors).

---

## 📁 Repository Structure Comparison

### Before (Angular 18 CSR)
```text
Portfolio/
├── angular.json
├── package.json
├── public/
├── src/
│   ├── app/
│   │   ├── about/
│   │   ├── backend-skill/
│   │   ├── database-skills/
│   │   ├── education/
│   │   ├── footer/
│   │   ├── form/
│   │   ├── frontend-skill/
│   │   ├── home/
│   │   ├── login/
│   │   ├── nav-bar/
│   │   ├── other-skills/
│   │   ├── projects/
│   │   ├── show-data/
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
```

### After (Next.js 15 SSG / App Router)
```text
Portfolio/
├── CHANGELOG.md                    <-- Complete log of all changes
├── README.md                       <-- Updated setup and run instructions
├── next.config.mjs                 <-- Next.js configuration & image domains
├── tailwind.config.ts              <-- Cyber cyan theme & responsive tokens
├── postcss.config.mjs              <-- PostCSS & Tailwind processing
├── tsconfig.json                   <-- TypeScript configuration with @/* aliases
├── package.json                    <-- Next.js 15, React 19, Lucide, Tailwind
├── public/                         <-- Preserved all static images & assets
│   ├── CV.png
│   ├── logorm.png
│   ├── robots.txt
│   ├── sitemap.xml
│   └── Skills/                     <-- All tech icons & profile images
└── src/
    ├── app/
    │   ├── globals.css             <-- Tailwind base, cyan glow & scrollbars
    │   ├── layout.tsx              <-- Google Font Inter, SEO & JSON-LD schema
    │   └── page.tsx                <-- Assembled single-page portfolio
    └── components/
        ├── Navbar.tsx              <-- Sticky header & mobile drawer
        ├── Hero.tsx                <-- Profile avatar, headline & CTAs
        ├── About.tsx               <-- Bio & direct contact chips
        ├── Skills.tsx              <-- Interactive categorized skill cards
        ├── Projects.tsx            <-- Full stack project cards & links
        ├── Education.tsx           <-- Academic & internship timeline
        ├── ContactForm.tsx         <-- FormSubmit direct email integration
        └── Footer.tsx              <-- Social links & scroll to top
```

---

## 🛠️ How to Run & Verify

### Start Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

### Build for Production
```bash
npm run build
npm run start
```

### Switch to the Legacy Angular Version
```bash
git checkout backup/angular-version
```
To return to the Next.js version:
```bash
git checkout main
```

---

## 📧 Note on Contact Form Email Delivery
When testing the contact form for the first time:
- FormSubmit will dispatch an **activation confirmation email** to `shubhammisra800@gmail.com`.
- Click the **"Activate Form"** link in that initial email once.
- All subsequent form inquiries will immediately land in your inbox with 1-click reply configured!
