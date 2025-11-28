# PCWL frontend workspace

This directory splits the client into a future-ready structure:

- `public/` – static HTML/JS/CSS/assets served by Nginx (via `scripts/start.sh` + `deploy/nginx.conf.template`). Pages: `index.html`, `create-account.html`, `leaderboard.html`, plus shared assets (`app.js`, `styles.css`, `data/`, `js/`).
- `src/` – reserved for modular ES source files when we wire up a bundler (Vite/Rollup/etc.)

`js/page-config.js` bootstraps environment data (API base URL, version, links) from `/api/pages/home/` or `/api/pages/leaderboard/` so the static pages stay in sync with the backend without Django templates.

As follow-up work, add a build tool (e.g., Vite) so `src/` becomes the source of truth and emits optimized assets into `public/` or a dedicated `dist/` folder that Nginx serves directly.

## Static map tiles

- `public/data/prague-districts.pmtiles` stores the pre-tiled Prague district outlines that MapLibre now reads via the PMTiles protocol-backed `public/js/pmtiles.js` helper.
- Regenerate it from `public/data/prague-districts.geojson` with Tippecanoe (e.g., `tippecanoe -o public/data/prague-districts.pmtiles -zg -f -l districts public/data/prague-districts.geojson`) whenever the district boundaries change so the asset can be versioned and served alongside the static app bundle.
- Buildings now optionally use PMTiles as well: drop `public/data/prague-building-polygons.pmtiles` (layer name `buildings`) beside the existing GeoJSON/TopoJSON. Generate it with Tippecanoe (e.g., `tippecanoe -o public/data/prague-building-polygons.pmtiles -zg -f -l buildings public/data/prague-building-polygons.geojson`). The app will automatically fall back to the GeoJSON/TopoJSON if the PMTiles file is missing.
