"""Build separate festival runner destinations and original vector game art."""
import json
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'assets' / 'festival'
ASSETS.mkdir(parents=True, exist_ok=True)
CATALOG = ROOT / 'src' / 'data' / 'catalog.json'

# Province planning figures list an official festival for every city/municipality.
FESTIVALS = [
 ('calapan_city','Kalap Festival','Calapan City','city heritage','⚓','#e6a23e'),
 ('calapan_pandang_gitab','Pandang Gitab Oriental Mindoro','Calapan City','festival lights','✺','#eeb669'),
 ('calapan_mahal_tana','Fiesta MAHAL TANA!','Calapan City','festival showcase','✦','#d38b75'),
 ('calapan_salong_dagitab','Salong Dagitab Festival','Calapan City','flickering lights','✷','#e2aa68'),
 ('baco','Banana Festival','Baco','banana harvest','✿','#83ad44'),
 ('bansud','Basudani Festival','Bansud','community celebration','✦','#e4a13d'),
 ('bongabong','Sulyog Festival','Bongabong','harvest dance','❋','#ce7956'),
 ('bulalacao','Biniray Festival','Bulalacao','coastal boats','◈','#3cabc1'),
 ('gloria','Kawayanan Festival','Gloria','bamboo craft','❖','#6c9e6e'),
 ('mansalay','Mangyan Festival','Mansalay','woven patterns','◇','#bf785c'),
 ('naujan','Dabalistihit Festival','Naujan','lake and harvest','✺','#73a3ae'),
 ('pinamalayan','Bahaghari Festival','Pinamalayan','rainbow colors','☼','#ba82b8'),
 ('pola','Sab-Uyan Festival','Pola','sea and community','✹','#64aeb5'),
 ('puerto_galera','Kaaldawan-Iraya Festival','Puerto Galera','woven celebration','◉','#728fc0'),
 ('roxas','Sipag Festival','Roxas','work and harvest','✷','#d3925c'),
 ('san_teodoro','MASAYAW Festival','San Teodoro','festival dance','✳','#83a973'),
 ('socorro','Pakapya-Agtike Festival','Socorro','community gathering','✻','#9a82b9'),
 ('victoria','Kapakyanan Festival','Victoria','abundance and thanks','❀','#d4a64d'),
]

def svg(name, body, width=960, height=540):
    (ASSETS / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img">{body}</svg>', encoding='utf-8')

def art(slug, title, locality, motif, glyph, color):
    label, town = escape(title), escape(locality)
    bg = f'''<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#183c62"/><stop offset="1" stop-color="{color}"/></linearGradient><pattern id="confetti" width="92" height="72" patternUnits="userSpaceOnUse"><circle cx="16" cy="19" r="4" fill="#ffe5a2"/><path d="M66 42l12 -8m-5 1l3 12" stroke="#fff0b5" stroke-width="3"/></pattern></defs><rect width="960" height="540" fill="url(#sky)"/><rect width="960" height="540" fill="url(#confetti)" opacity=".65"/><circle cx="760" cy="110" r="65" fill="#ffd788"/><path d="M0 365q130 -95 280 0t310 -25t370 5v195H0" fill="#1e5869"/><path d="M0 433q160 -48 320 7t320 -10t320 10v100H0" fill="#143f54"/><path d="M100 540v-166m760 166V374" stroke="#ffe4a0" stroke-width="15"/><path d="M100 383q375 -110 760 0" fill="none" stroke="#ffe4a0" stroke-width="8"/><g fill="#fff1c6"><path d="M170 350l35 56h-70z"/><path d="M310 326l35 56h-70z"/><path d="M450 310l35 56h-70z"/><path d="M590 310l35 56h-70z"/><path d="M730 326l35 56h-70z"/></g><text x="480" y="176" text-anchor="middle" font-family="Arial,sans-serif" font-size="76" font-weight="bold" fill="#fff7df">{escape(glyph)}</text><text x="480" y="230" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#fff7df">{label}</text><text x="480" y="270" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" fill="#fff7df">{town} · Oriental Mindoro</text>'''
    # Photographic runner backdrops are generated separately and kept as PNGs.
    # Transparent runner, collectible, and icon PNGs are generated separately.

catalog = json.loads(CATALOG.read_text(encoding='utf-8'))
catalog = [d for d in catalog if not d['destinationID'].startswith('festival_oriental_mindoro_')]
for slug, title, locality, motif, glyph, color in FESTIVALS:
    art(slug, title, locality, motif, glyph, color)
    dest_id = f'festival_oriental_mindoro_{slug}'
    titles = [f'{title}: arrival trail', f'{motif.title()} keepsakes', 'Parade star run', 'Festival finale']
    types = ['collectCoins', 'collectSignatureItems', 'collectStars', 'collectAndSurvive']
    targets = [14, 5, 9, 6]
    levels = []
    for i in range(4):
        n = i + 1
        levels.append({'id':f'{dest_id}_level_{n}','destinationID':dest_id,'number':n,'title':titles[i],
          'mission':{'type':types[i],'target':targets[i],'timeLimit':75+i*8,**({'secondaryTarget':35} if i==3 else {}),'minimumKeepsakes':2 if i!=1 else 0,'maximumDamage':3},
          'lives':4,'speedMultiplier':1+i*.04,'spawnIntervalMultiplier':1-i*.03,'obstacleDensity':.10+i*.01,'hazardFrequency':.07+i*.01,
          'rewardTravelerXP':70+i*12,'rewardDestinationXP':140,'oneStarScore':700+i*120,'twoStarScore':1150+i*140,'threeStarScore':1600+i*160,
          'failureXPFactor':.18,'isFinalChallenge':i==3})
    catalog.append({'destinationID':dest_id,'name':title,'group':'Oriental Mindoro Festivals','image':f'festival/{slug}_background.png',
      'signatureItemName':f'{title} keepsake','signatureImage':f'festival/{slug}_item.png','passportImage':f'festival/{slug}_icon.png',
      'spriteImage':f'festival/{slug}_runner.png','spriteName':'Festival guide','localityType':locality,'sourceUrl':'https://www.travelorientalmindoro.ph/Festivals/',
      'levels':levels,'recovered':False,'custom':True})
CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
festival_rows = [d for d in catalog if d['group'] == 'Oriental Mindoro Festivals']
migration = ROOT / 'supabase' / 'migrations' / '20261108000200_seed_festival_destinations.sql'
migration.write_text('''-- Publish festival routes to existing Supabase projects after the festival columns migration.
insert into public.destinations
  (id, name, adventure_group, locality_type, image, signature_item_name, signature_image,
   passport_image, sprite_image, sprite_name, levels, source_url, recovered, custom, sort_order)
select x ->> 'destinationID', x ->> 'name', x ->> 'group', x ->> 'localityType',
       x ->> 'image', x ->> 'signatureItemName', x ->> 'signatureImage',
       x ->> 'passportImage', x ->> 'spriteImage', x ->> 'spriteName',
       x -> 'levels', x ->> 'sourceUrl', false, true, (o + 68)::int
from jsonb_array_elements($festival$''' + json.dumps(festival_rows, ensure_ascii=False, separators=(',', ':')) + '''$festival$::jsonb) with ordinality as t(x, o)
on conflict (id) do update set
  name = excluded.name, adventure_group = excluded.adventure_group,
  locality_type = excluded.locality_type, image = excluded.image,
  signature_item_name = excluded.signature_item_name, signature_image = excluded.signature_image,
  passport_image = excluded.passport_image, sprite_image = excluded.sprite_image,
  sprite_name = excluded.sprite_name, levels = excluded.levels,
  source_url = excluded.source_url, recovered = excluded.recovered,
  custom = excluded.custom;
''', encoding='utf-8')
