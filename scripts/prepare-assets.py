"""Build a small, self-contained GLB selection from the CC0 source packs.
Run from the repository root. Geometry is preserved; source textures are resized
to 512px and embedded, so no runtime requests reach a third-party host.
"""
import io
import json
import pathlib
import shutil
import struct
import urllib.parse
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/models'
OUT.mkdir(parents=True, exist_ok=True)
selection = {
    'quaternius-nature': ['CommonTree_1', 'CommonTree_3', 'Pine_1', 'Bush_Common_Flowers', 'Fern_1', 'Flower_3_Group', 'Flower_4_Group', 'Rock_Medium_1', 'Rock_Medium_2'],
    'quaternius-village': ['Roof_RoundTiles_6x8', 'Prop_Chimney', 'Door_1_Round', 'Window_Wide_Round1', 'Prop_Vine1', 'Prop_WoodenFence_Single'],
    'kenney-furniture': ['desk', 'chairDesk', 'computerScreen', 'computerKeyboard', 'books', 'bookcaseOpen', 'pottedPlant', 'bench', 'rugDoormat', 'lampRoundTable', 'laptop', 'plantSmall2', 'rugRectangle', 'bear', 'kitchenCoffeeMachine', 'tableCoffee'],
    'kenney-city': ['building-a', 'building-c', 'building-f', 'building-h', 'building-j', 'detail-awning', 'building-skyscraper-a', 'building-skyscraper-c', 'building-l'],
    'kenney-food': ['apple', 'loaf-baguette', 'cup-tea', 'plate', 'croissant', 'cup-coffee'],
}

def glb(source, destination):
    binary = bytearray()
    if source.suffix == '.glb':
        payload = source.read_bytes()
        js_size = struct.unpack_from('<I', payload, 12)[0]
        data = json.loads(payload[20:20 + js_size])
        if not any('uri' in image for image in data.get('images', [])):
            shutil.copyfile(source, destination)
            return
        binary.extend(payload[28 + js_size:])
    else:
        data = json.loads(source.read_text())
    def append(payload):
        while len(binary) % 4:
            binary.append(0)
        offset = len(binary)
        binary.extend(payload)
        return offset
    if source.suffix == '.gltf':
        offsets = []
        for buffer in data['buffers']:
            offsets.append(append((source.parent / urllib.parse.unquote(buffer['uri'])).read_bytes()))
        for view in data.get('bufferViews', []):
            view['byteOffset'] = view.get('byteOffset', 0) + offsets[view.get('buffer', 0)]
            view['buffer'] = 0
    textures = data.get('textures', [])
    data_maps = set()
    for material in data.get('materials', []):
        for slot in (material.get('normalTexture'), material.get('occlusionTexture'), material.get('pbrMetallicRoughness', {}).get('metallicRoughnessTexture')):
            if slot is not None:
                data_maps.add(textures[slot['index']].get('source'))
    for index, image in enumerate(data.get('images', [])):
        if 'uri' not in image:
            continue
        with Image.open(source.parent / urllib.parse.unquote(image.pop('uri'))) as texture:
            texture.thumbnail((512, 512), Image.Resampling.LANCZOS)
            encoded = io.BytesIO()
            has_alpha = texture.convert('RGBA').getchannel('A').getextrema()[0] < 255
            # Keep alpha, normal maps and Kenney's hard-edged colour atlases
            # lossless. Large opaque colour textures tolerate JPEG very well.
            jpeg = not has_alpha and index not in data_maps and source.suffix == '.gltf'
            if jpeg:
                texture.convert('RGB').save(encoded, format='JPEG', quality=88, optimize=True, subsampling=0)
            else:
                texture.save(encoded, format='PNG', optimize=True)
        payload = encoded.getvalue()
        offset = append(payload)
        image['bufferView'] = len(data.setdefault('bufferViews', []))
        image['mimeType'] = 'image/jpeg' if jpeg else 'image/png'
        data['bufferViews'].append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(payload)})
    data['buffers'] = [{'byteLength': len(binary)}]
    js = json.dumps(data, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    binary += b'\0' * (-len(binary) % 4)
    destination.write_bytes(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binary)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binary), 0x004E4942) + binary)

manifest = []
for pack, names in selection.items():
    folder = ROOT / 'assets/source' / pack
    for name in names:
        source = next(p for p in folder.rglob(name + '.*') if p.suffix in ('.gltf', '.glb'))
        destination = OUT / (name + '.glb')
        glb(source, destination)
        manifest.append({'file': destination.name, 'pack': pack, 'bytes': destination.stat().st_size})
    licence = next(p for p in folder.rglob('*.txt') if 'licen' in p.name.lower())
    shutil.copyfile(licence, OUT / (pack + '-LICENSE.txt'))
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print(f'{len(manifest)} GLBs, {sum(x["bytes"] for x in manifest) / 1024**2:.2f} MiB')
