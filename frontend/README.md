# PCWL frontend workspace

This directory splits the client into a future-ready structure:

- `public/` – files served directly by Django (current `app.js`, `styles.css`, `data/`, and helper JS modules)
- `src/` – reserved for modular ES source files when we wire up a bundler (Vite/Rollup/etc.)

As follow-up work, add a build tool (e.g., Vite) so `src/` becomes the source of truth and emits optimized assets into `public/` or a dedicated `dist/` folder that Django serves via `STATICFILES_DIRS`.
