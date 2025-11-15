#!/usr/bin/env python3
import json
from pathlib import Path

repo_root = Path(__file__).resolve().parents[1]
data_dir = repo_root / 'frontend' / 'public' / 'data'
output = data_dir / 'prague-basemap.geojson'

features = [{
    'type': 'Feature',
    'properties': {'name': 'placeholder', 'kind': 'info'},
    'geometry': {'type': 'Point', 'coordinates': [14.42, 50.09]},
}]

output.write_text(json.dumps({'type': 'FeatureCollection', 'features': features}, indent=2))
print(f'Wrote {output}')
