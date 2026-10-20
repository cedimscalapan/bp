import {heritageSources} from './heritage';
export function Sources({ids}:{ids:string[]}){return <details className="heritage-sources"><summary>Sources</summary>{ids.map(id=>{const s=heritageSources.find(s=>s.id===id);return s&&<a key={id} href={s.url} target="_blank" rel="noopener noreferrer">{s.publisher} · {s.title} ↗</a>;})}</details>;}
