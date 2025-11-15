# PCWL frontend workspace

This directory splits the client into a future-ready structure:

- `public/` – files served directly by Django (current `app.js`, `styles.css`, `data/`, and helper JS modules)
- `src/` – reserved for modular ES source files when we wire up a bundler (Vite/Rollup/etc.)

As follow-up work, add a build tool (e.g., Vite) so `src/` becomes the source of truth and emits optimized assets into `public/` or a dedicated `dist/` folder that Django serves via `STATICFILES_DIRS`.

## Static map tiles

- `public/data/prague-districts.pmtiles` stores the pre-tiled Prague district outlines that MapLibre now reads via the PMTiles protocol-backed `public/js/pmtiles.js` helper.
- Regenerate it from `public/data/prague-districts.geojson` with Tippecanoe (e.g., `tippecanoe -o public/data/prague-districts.pmtiles -zg -f -l districts public/data/prague-districts.geojson`) whenever the district boundaries change so the asset can be versioned and served alongside the static app bundle.
