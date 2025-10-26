#!/usr/bin/env python3
"""
convert_prague_data.py
----------------------

Helper script that reprojects the raw Prague GIS assets you dropped into `data/`
from S-JTSK / Křovák coordinates (EPSG:5514) to WGS‑84 (EPSG:4326) and writes
Leaflet-friendly outputs.

Prerequisites:
  * GDAL/OGR command line tools (`ogr2ogr`, `gdalwarp`, `gdal_translate`) must
    be installed and on PATH.

Usage examples:
  python3 scripts/convert_prague_data.py
  python3 scripts/convert_prague_data.py --output data/build-cache

The script will:
  • Convert building polygons and points to GeoJSON
  • Reproject the absolute-height raster and export it as PNG + world file
  • Optionally copy the generated artefacts into a versioned directory
"""

import argparse
import shutil
import subprocess
from pathlib import Path
from typing import List


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

POLY_SRC = DATA_DIR / "DTMP_CUR_TMBUDOVA_B" / "TMBUDOVA_B.shp"
POINT_SRC = DATA_DIR / "DTMP_CUR_TMBUDOVA_P" / "TMBUDOVA_P.shp"
RASTER_SRC = DATA_DIR / "bud_abs" / "bud_abs.tif"

POLY_OUT = DATA_DIR / "prague-buildings.geojson"
POINT_OUT = DATA_DIR / "prague-building-points.geojson"
RASTER_TIF_OUT = DATA_DIR / "prague-relief-abs.tif"
RASTER_PNG_OUT = DATA_DIR / "prague-relief-abs.png"


def require_tool(name: str) -> None:
    if shutil.which(name) is None:
        raise SystemExit(f"Required tool '{name}' not found on PATH. Install GDAL/OGR first.")


def run(cmd: List[str]) -> None:
    print(f"[cmd] {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


def convert_buildings() -> None:
    if POLY_SRC.exists():
        run(["ogr2ogr", "-t_srs", "EPSG:4326", str(POLY_OUT), str(POLY_SRC)])
    else:
        print(f"[skip] {POLY_SRC} not found (building polygons)")

    if POINT_SRC.exists():
        run(["ogr2ogr", "-t_srs", "EPSG:4326", str(POINT_OUT), str(POINT_SRC)])
    else:
        print(f"[skip] {POINT_SRC} not found (building points)")


def convert_raster() -> None:
    if not RASTER_SRC.exists():
        print(f"[skip] {RASTER_SRC} not found (absolute height raster)")
        return

    run(
        [
            "gdalwarp",
            "-t_srs",
            "EPSG:4326",
            "-r",
            "bilinear",
            str(RASTER_SRC),
            str(RASTER_TIF_OUT),
        ]
    )
    run(
        [
            "gdal_translate",
            "-of",
            "PNG",
            "-co",
            "WORLDFILE=YES",
            str(RASTER_TIF_OUT),
            str(RASTER_PNG_OUT),
        ]
    )


def copy_to_build(output_dir: Path) -> None:
    if not output_dir.exists():
        print(f"[info] creating output directory {output_dir}")
        output_dir.mkdir(parents=True, exist_ok=True)

    for src in (POLY_OUT, POINT_OUT, RASTER_PNG_OUT):
        if src.exists():
            dest = output_dir / src.name
            shutil.copy2(src, dest)
            print(f"[copy] {src.name} -> {dest}")

    png_world = RASTER_PNG_OUT.with_suffix(".pgw")
    if png_world.exists():
        dest = output_dir / png_world.name
        shutil.copy2(png_world, dest)
        print(f"[copy] {png_world.name} -> {dest}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Reproject Prague GIS datasets to WGS-84 GeoJSON/PNG.")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional directory to copy results into (defaults to skipping the copy step).",
    )
    args = parser.parse_args()

    for tool in ("ogr2ogr", "gdalwarp", "gdal_translate"):
        require_tool(tool)

    convert_buildings()
    convert_raster()
    if args.output:
        copy_to_build(args.output)

    print("\nDone. Updated files:")
    print(f"  • {POLY_OUT.relative_to(ROOT)}")
    print(f"  • {POINT_OUT.relative_to(ROOT)}")
    print(f"  • {RASTER_TIF_OUT.relative_to(ROOT)} / {RASTER_PNG_OUT.relative_to(ROOT)} (+ .pgw)")
    if args.output:
        print(f"  • Copies in {args.output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
