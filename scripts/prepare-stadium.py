"""Resize embedded stadium textures and remove expensive glass transmission."""
import io
import json
import struct
import sys
from pathlib import Path

from PIL import Image

source, destination = map(Path, sys.argv[1:])
blob = source.read_bytes()
json_size = struct.unpack_from('<I', blob, 12)[0]
model = json.loads(blob[20:20 + json_size])
binary = blob[28 + json_size:]
images = {image['bufferView']: image for image in model['images']}
packed = bytearray()

for index, view in enumerate(model['bufferViews']):
    offset = view.get('byteOffset', 0)
    payload = binary[offset:offset + view['byteLength']]
    if index in images:
        image = images[index]
        texture = Image.open(io.BytesIO(payload))
        limit = 1024 if image['name'] == 'tt502_pitch' else 256
        texture.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        if image['mimeType'] == 'image/jpeg':
            texture.convert('RGB').save(output, 'JPEG', quality=83, optimize=True)
        else:
            texture.save(output, 'PNG', optimize=True)
        payload = output.getvalue()

    packed.extend(b'\0' * (-len(packed) % 4))
    view.update(byteOffset=len(packed), byteLength=len(payload))
    packed.extend(payload)

for material in model['materials']:
    extensions = material.get('extensions', {})
    if extensions.pop('KHR_materials_transmission', None):
        material['pbrMetallicRoughness']['roughnessFactor'] = .46
    extensions.pop('KHR_materials_ior', None)
    if not extensions:
        material.pop('extensions', None)
model['extensionsUsed'] = ['KHR_materials_emissive_strength']

packed.extend(b'\0' * (-len(packed) % 4))
model['buffers'][0]['byteLength'] = len(packed)
encoded = json.dumps(model, separators=(',', ':')).encode()
encoded += b' ' * (-len(encoded) % 4)
header = struct.pack('<4sIIII', b'glTF', 2, 28 + len(encoded) + len(packed), len(encoded), 0x4E4F534A)
destination.write_bytes(header + encoded + struct.pack('<II', len(packed), 0x004E4942) + packed)
print(f'{len(blob) / 2**20:.2f} MiB -> {destination.stat().st_size / 2**20:.2f} MiB')
