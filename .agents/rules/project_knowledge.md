# Project Knowledge

## Overview
This is an Angular 18 portfolio project for Shubham, a Full Stack Software Developer specializing in Java, Angular, and Cloud technologies.

## Tech Stack
- **Framework:** Angular 18 (`@angular/core` ^18.0.0)
- **Styling:** Bootstrap 5, Tailwind CSS, and Vanilla CSS
- **Testing:** Jasmine and Karma
- **Structure:** Standard Angular structure with modular components (about, projects, education, home, login, skills).

## Design System
- **Color Palette:**
  - Primary Background: #0a0e17 - #0d1420 (Deep blue-black gradient)
  - Accent Color: #00d9ff (Vibrant cyan)
  - Secondary: #0099cc (Deep cyan)
  - Text: #ffffff, #c0d0e0 (High contrast whites and light blues)
- **Theme:** Modern tech aesthetic, similar to Awwwards designs.

## SEO & Best Practices
- Semantic HTML tags are extensively used.
- Structured Data (JSON-LD) for a "Person" schema is present in `index.html`.
- Open Graph and Twitter card meta tags are configured for `https://www.skm-tech.xyz/`.

## Contact Form & Email Integration
- Contact form submissions are routed via FormSubmit (`https://formsubmit.co/ajax/shubhammisra800@gmail.com`).
- Direct submissions deliver structured email tables to `shubhammisra800@gmail.com` with `_replyto` set to the visitor's email for 1-click reply.
- Asynchronous backup is dispatched to the Railway database backend.

## Important Rules for AI Assistants
1. Keep the cyan/teal accent colors consistent across new components.
2. Favor modern, responsive layouts using Tailwind CSS alongside Bootstrap.
3. Keep the JSON-LD schema up to date when adding new skills or project URLs.
4. Ensure all images maintain proper aspect ratios and utilize `loading="lazy"` attributes.
5. In Angular 18 templates, escape literal `@` in email text as `&#64;` to avoid Angular control flow compiler errors.
