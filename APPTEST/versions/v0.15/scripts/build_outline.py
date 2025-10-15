import json
import subprocess
from pathlib import Path

data_path = Path('/Users/jonaspalecek/Desktop/APPTEST/data')
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
