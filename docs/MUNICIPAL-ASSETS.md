# Separate municipal artwork — KaPamana 1.10.0

All 15 Oriental Mindoro destinations have three separate, generated assets: a falling collectible token, a passport stamp and a static fictional story sprite. No image file is reused or recolored for another destination.

| Place | Token | Story sprite |
| --- | --- | --- |
| Puerto Galera | Nito basket | Harbor lanternfish |
| San Teodoro | River drop | Cloud gardener |
| Baco | Paco fern | Fern stone guardian |
| Calapan City | Trading scale | Parcel messenger |
| Naujan | Fish observation lens | Reed bird |
| Victoria | Rambutan | Orchard snail |
| Socorro | Coffee cherries | Coffee seedling |
| Pola | Nipa panel | Folded-leaf crab |
| Pinamalayan | Rainbow pot | Rainbow kite |
| Gloria | Bamboo craft box | Bamboo sprout dragon |
| Bansud | Banana bunch | Banana blossom |
| Bongabong | Coconut-work bowl | Coconut drummer |
| Roxas | Rice sheaf | Harvest cart |
| Mansalay | Bamboo writing materials | Bookwing moth |
| Bulalacao | Seaweed noodles | Seaweed seahorse |

Stamp outlines vary by destination: scalloped shell, pointed arch, triangle, notched rectangle, oval, hexagon, diamond, fan, pennant, octagon, shield, capsule, trapezoid, book and wavy frame. Illustrations are symbolic app art, not precise maps, official seals, traditional beings or claims of community endorsement. The Calapan stamp uses an abstract commerce/transport scene; Mansalay uses blank writing materials without invented Indigenous inscriptions. Festivals are excluded.

The 45 runtime files are in public/assets/municipal/. Tokens are 256×256, stamps 384×384 and sprites 512×512, with preserved alpha transparency. Together they add about 5.1 MB of WebP files. Original PNGs and ready PNG/WebP exports are delivered separately in the municipal asset ZIP.

- src/data/municipal_assets.json maps all three asset roles to each destination.
- Tokens are used in existing missions and collectible descriptions.
- Passport collection tiles use the separate passport art.
- Destination detail panels display the fictional static story sprites. Existing player Buddies and their abilities remain available.
- The token catalog and heritage pickup fields stay synchronized, preserving mission IDs and existing save progress.
- docs/municipal-art-prompts.json contains the approved generation prompts. Built-in image generation was used; no API/CLI fallback was used.

Validation covers 15 destination mappings, 45 distinct asset paths and file hashes, PNG alpha checks, mobile export dimensions and browser image loading. A distinct-file check confirms no exact file duplicates; visual review checks motifs and silhouettes within this collection.
