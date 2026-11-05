# Sourced assets

Downloaded 5 November 2026 from the original creators. All five archives passed ZIP CRC validation. Bundled licences confirm CC0; attribution is optional. The scene uses 57 selected models as local GLBs, with licences and a per-file manifest in `public/models/`.

| Pack | Web models staged |
| --- | --- |
| [quaternius-nature](https://quaternius.itch.io/stylized-nature-megakit) | 68 |
| [quaternius-village](https://quaternius.itch.io/medieval-village-megakit) | 176 |
| [kenney-furniture](https://kenney.nl/assets/furniture-kit) | 140 |
| [kenney-city](https://kenney.nl/assets/city-kit-commercial) | 41 |
| [kenney-food](https://kenney.nl/assets/food-kit) | 200 |

Web source models, supporting files and licences are staged in `assets/source/<pack>`. Its manifest records the downloaded inventory and bundled licence text. Duplicate ZIPs were removed to recover disk space after the web source files were extracted.

The office also uses three CC0 GLBs from Poly Pizza: [Houseplant by Quaternius](https://poly.pizza/m/VtJh4Irl4w), [Pothos Plant Small by Isa Lousberg](https://poly.pizza/m/JVoJ2itVzh), and [ZZ Plant Pot by Isa Lousberg](https://poly.pizza/m/0uJQPU1oAK). The original GLBs are stored in `public/models/`.

The preparation script embeds referenced textures, including Kenney's external colour maps, and resizes larger textures to a maximum of 512 pixels per side. Opaque Quaternius colour maps use JPEG while alpha masks and data textures stay lossless. The 57 runtime files total about 12.7 MiB. Repeated vegetation shares geometry and materials. No external model service is contacted at runtime. The basket, mountain, paths and illustrated fallback are original scene geometry or SVG.

The [Innerscene Football Stadium](https://www.innerscene.com/tools/library/3d-parts/football-stadium-f7b93967) is CC0. To reproduce the bundled model, download the original GLB and run `python scripts/prepare-stadium.py <source.glb> public/models/footballStadium.glb` with Pillow installed. The script resizes textures and removes glass transmission for real-time rendering.

The [Lighthouse by Poly by Google](https://poly.pizza/m/0t2ZYRBsqX-) is licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The original GLB is bundled as supplied, with a beacon added in the scene. The [Deer by Quaternius](https://poly.pizza/m/T6Cs7tmMHJ) is CC0 and uses its supplied walk and eating animations.

The lookout uses the [Telescope by CreativeTrio](https://poly.pizza/m/RjyTCQvA8b). The ferry uses the [Sail Boat by Quaternius](https://poly.pizza/m/BgSZXwmm7k), with lift pods added in the scene. Both source models are CC0.
