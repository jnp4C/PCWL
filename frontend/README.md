# PCWL frontend workspace

This directory splits the client into a future-ready structure:

- `public/` – static HTML/JS/CSS/assets served by Nginx (via `scripts/start.sh` + `deploy/nginx.conf.template`). Pages: `index.html`, `create-account.html`, `leaderboard.html`, plus shared assets (`app.js`, `styles.css`, `data/`, `js/`).
- `src/` – reserved for modular ES source files when we wire up a bundler (Vite/Rollup/etc.)

`src/` now houses the Vite + React + Redux implementation:
- Generic CRUD thunks/slices live in `src/api/crud.ts` and feature slices (players, districts, parties, friends, session, leaderboard).
- Pages/components: `src/pages/*`, `src/components/*`.
- App version is injected at build (`__APP_VERSION__` via git tag when available) and rendered in the footer.

Build/dev
- Install deps: `npm install` (Node 18+ recommended).
- Dev server: `npm run dev` (Vite) with API requests pointed at `/api`.
- Production build: `npm run build` → `dist/` (copied by Docker/start.sh). Falls back to `public/` if no build is present.

## Static map tiles

- `public/data/prague-districts.pmtiles` stores the pre-tiled Prague district outlines that MapLibre now reads via the PMTiles protocol-backed `public/js/pmtiles.js` helper.
- Regenerate it from `public/data/prague-districts.geojson` with Tippecanoe (e.g., `tippecanoe -o public/data/prague-districts.pmtiles -zg -f -l districts public/data/prague-districts.geojson`) whenever the district boundaries change so the asset can be versioned and served alongside the static app bundle.
- Buildings now optionally use PMTiles as well: drop `public/data/prague-building-polygons.pmtiles` (layer name `buildings`) beside the existing GeoJSON/TopoJSON. Generate it with Tippecanoe (e.g., `tippecanoe -o public/data/prague-building-polygons.pmtiles -zg -f -l buildings public/data/prague-building-polygons.geojson`). The app will automatically fall back to the GeoJSON/TopoJSON if the PMTiles file is missing.
