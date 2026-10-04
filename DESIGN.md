# Candy 2.0 — Soft Pop

## North Star: "Joyful, but polished"
The original Candy identity (saturated color, pill shapes, bouncy motion) leveled up with atmosphere: ambient gradient blobs, film grain, glassy panels and a display typeface with personality. Delight with depth, not just brightness.

## Colors
- **Primary (`#e040a0`):** Hot pink — primary actions and brand identity.
- **Secondary (`#7c52aa`):** Purple — secondary elements, tags, categories.
- **Tertiary (`#0096cc`):** Sky blue — informational, links, highlights.
- **Background (`#fef7ff`):** Very light pink-white, layered with fixed ambient radial blobs (pink / purple / sky) that drift slowly, plus a 3% film-grain overlay.
- Gradients are first-class: `hero-gradient` (panels, balance card), `sidebar-gradient` (navigation), `btn-gradient` (primary button), `text-gradient` (headlines).

## Typography
- **Display:** Baloo 2 — rounded, characterful, used for headings and big numbers (`font-display`).
- **Body:** DM Sans — rounded, friendly, modern.
- Bold weight for headings, medium for labels. Generous line-height. 16px base.

## Shapes & Motion
- **Border radius:** Full/pill on buttons and badges. 16-20px on cards.
- **Microinteractions:** Bouncy hover transitions (`transform: scale(1.03)`, spring-like cubic-bezier).
- **Shadows:** Layered and tinted — `shadow-soft` for cards (neutral + pink + purple layers), `shadow-primary/secondary/tertiary` for tinted glows.
- **Reveal:** `animate-fade-up` with staggered `animation-delay` for page content; `animate-float-slow` for decorative blobs.

## Components
- **Buttons:** Pill-shaped. Default is the pink→purple `btn-gradient` with a deep tinted shadow; hover = scale + brightness.
- **Cards:** White fill with `card-gloss` gradient hairline border option, layered `shadow-soft`, hover lift.
- **Sidebar:** Deep pink→purple gradient, white text, glassy active pill (`bg-white/20` + backdrop blur).
- **Badges/Tags:** Pill-shaped, pastel fill with inset ring.
- **Inputs:** Rounded (full radius), light fill, pink focus ring.
- **Loader:** `CandyLoader` — conic-gradient ring (pink → purple → sky).
- **Empty states:** `EmptyState` — icon inside a floating gradient blob.
- **Page headers:** `PageHeader` — gradient display title, colored icon chip, action slot.

## Rules
- Embrace color contrast and saturation. Nothing should feel washed out.
- Rounded shapes everywhere — no sharp corners in this system.
- Animations should feel bouncy and playful, not stiff. Use ease-out curves.
- Ambient decoration (blobs, grain) must stay behind content and never capture pointer events.
