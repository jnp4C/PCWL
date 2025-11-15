import json
import subprocess
from pathlib import Path

repo_root = Path(__file__).resolve().parents[1]
data_path = repo_root / 'frontend' / 'public' / 'data'
districts = data_path / 'prague-districts.geojson'
dissolved = data_path / 'prague-districts-dissolve.geojson'
outline = data_path / 'prague-boundary.geojson'

# dissolve districts to single polygon
subprocess.run([
    'mapshaper', str(districts),
    '-dissolve',
    '-o', 'format=geojson', str(dissolved)
], check=True)

# convert polygon to boundary line
subprocess.run([
    'mapshaper', str(dissolved),
    '-explode',
    '-lines',
    '-o', 'format=geojson', str(outline)
], check=True)

print('updated', outline)
