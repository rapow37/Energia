# Implementation Decisions & Engineering Log — ENERGIA

## Phase 0 Decisions & Assumptions
1. **Design Files Source**: All UI/UX designs are stored in `design-reference/` as self-contained interactive HTML bundles created with a custom bundler. We extracted inner templates to `extracted_templates/` for precise inspection.
2. **Framework Choice**: Next.js App Router with TypeScript and Tailwind CSS, following the project's recommended tech stack and matching the exact visual design tokens (colors, typography like Inter and Plus Jakarta Sans, spacing, border radius, and elevation shadows).
3. **Asset Management**: SVGs and JSON sprite atlas (`energia_quest_sprite_atlas.json` + `energia_quest_sprite_sheet.svg`) are preserved and available for the Energy Quest module.
4. **Physics Accuracy**: Energy Lab simulations will use strict formulas ($E_p = mgh$, $E_k = \frac{1}{2}mv^2$, $E_m = E_p + E_k$). Friction will correctly reduce mechanical energy while tracking thermal energy dissipation.
5. **Realtime & Backend**: Supabase PostgreSQL + Auth + Realtime will power authentication, teacher/student classes, classroom battle sessions, assignments, and persistent progress.
