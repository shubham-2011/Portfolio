# Website Component Audit — "De-AI-ify" Master Reference Guide
*Senior Product Designer (10+ Years Experience) Component-Level Review & Implementation Policy*

---

## 1. Master Review Prompt

> Act as a senior product designer with 10+ years of experience auditing consumer/SaaS websites. Go through my website component by component (navigation, hero, buttons, cards, forms, footer, typography, spacing, imagery, micro-interactions) and identify anything that reads as generic "AI-generated template" design. For each component, tell me:
> 1. What's wrong / generic about it
> 2. Why it reads as templated
> 3. A specific, opinionated fix (not a vague suggestion)
>
> Then apply the fixes. Prioritize distinctiveness and intentionality over "safe" default choices. Avoid: centered hero + gradient blob, purple-blue gradients, Inter/generic sans everywhere, 3-icon feature rows, generic rounded-card-with-shadow patterns, emoji-as-icons, stock photo people, symmetric everything.

---

## 2. Component-by-Component Audit Matrix

| # | Component | ❌ Generic / "AI-Generated" Template Pattern | ✅ Specific Opinionated Senior Designer Fix |
| :-: | :--- | :--- | :--- |
| **1** | **Navigation** | Logo on left, 4–5 centered links, pill-shaped "Sign up" button. | Vary link spacing intentionally, use text-only CTA or high-contrast box, explore distinct minimal status badges. |
| **2** | **Hero Section** | Centered headline + subhead + 2 buttons + gradient blob + floating mockup. | Break symmetry: left-aligned content, asymmetric interactive 3D particle canvas / visual anchor, high-contrast typography. |
| **3** | **Typography** | Default Inter/system-ui for everything; uniform weight and flat hierarchy. | Dramatic size contrast between bold headlines and technical subheadings; strict monospace/sans pairing with rhythm. |
| **4** | **Color Palette** | Generic purple-to-blue gradient or safe SaaS blue (`#4F46E5`) + gray. | Obsidian black (`#000000`), zinc-900, crisp white text, and emerald / cyan functional signals only. |
| **5** | **Buttons** | Fully rounded pill buttons with blurry drop shadow; hover = slightly darker. | Unified rounded-xl / sharp commitment, real motion transforms (`hover:scale-105 active:scale-95`), tactile white-on-black contrast. |
| **6** | **Cards / Blocks** | 3-column grid, generic rounded cards with soft shadows, icon-title-description. | Asymmetric 3D carousel / curved cylinder reel with depth scaling, distinct borders (`border-white/15`), contextual metadata. |
| **7** | **Icons** | Lucide default set all same size and stroke weight, forced on every single item. | Restrained, purposeful icon usage with distinct container styling (`p-2.5 bg-white/10`) and clean alignment. |
| **8** | **Imagery** | Stock photo people smiling at laptops or generic 3D blob renders. | Verified real project architecture screenshots, authentic developer portrait with subtle halo, zero placeholder graphics. |
| **9** | **Spacing & Layout** | Everything centered, equal padding everywhere, predictable 12-col grid. | Intentional whitespace, distinct desktop vs. mobile layouts (snap reel on mobile, 3D perspective stage on desktop). |
| **10** | **Section Breaks** | White section → gray section → white section with horizontal lines. | Obsidian-black continuum with 3D celestial particle sphere layers (`ParticleSphere.tsx`) and subtle border dividers. |
| **11** | **Forms** | Generic rounded inputs with gray borders, floating labels, centered submit button. | Sleek dark inputs (`bg-black/70 border-zinc-700`), high-contrast focus rings, clear character counters, real-time feedback. |
| **12** | **Footer** | 4-column link dump + copyright + social icons on generic gray. | Minimal, high-impact single-row developer footer with quick status indicator, direct channel links, and clean copyright. |
| **13** | **Micro-interactions** | Generic fade-in-on-scroll for every element. | Smooth 60fps Framer Motion transitions, real-time particle physics, adaptive line-by-line streaming in AI chatbot. |
| **14** | **Aesthetic POV** | Generic SaaS template look with no visual signature. | **Signature Aesthetic**: *Minimalist Obsidian-Black High-Performance Engineer* — sleek, dark, confident, technical. |

---

## 3. Workflow & Future Usage Guidelines

When you want to run a design audit or apply specific design modifications:
1. Specify which component(s) from the matrix you want to refine.
2. Provide your chosen aesthetic reference (e.g., *Minimalist Obsidian-Black*, *Editorial Swiss*, *Brutalist Terminal*).
3. The codebase will update the designated component while respecting [`.agents/rules/design-integrity.md`](file:///d:/Program/Frontend/Angular/Portfolio/.agents/rules/design-integrity.md).
