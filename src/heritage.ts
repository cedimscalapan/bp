import data from './data/heritage.json';
import runnerHistory from './data/runner-history.json';
import {destinationStamped} from './model';
import type { Destination, Level, Save } from './model';
import type { Run } from './engine';
export const heritageProfiles=data.profiles.map(p=>({...p,discoveries:[...p.discoveries,...runnerHistory.filter(f=>f.placeID===p.destinationID)]}));
export const heritageSources=data.sources;
export const heritageFor=(id:string)=>heritageProfiles.find(p=>p.destinationID===id);
export const discoveryFor=(id:string,mission:number)=>heritageFor(id)?.discoveries.find(d=>d.suggestedMission===mission);
export const journalUnlocked=(d:Destination,s:Save)=>destinationStamped(d,s);
export function recordDiscovery(s:Save,d:Destination,l:Level,r:Run):Save {
 const fact=discoveryFor(d.destinationID,l.number);if(!fact)return s;
 return {...s,discoveries:[...new Set([...s.discoveries,fact.id])],careBadges:r.status==='won'&&l.number===4&&r.damage===0?[...new Set([...s.careBadges,d.destinationID])]:s.careBadges};
}
export function learnedDiscoveries(d:Destination,s:Save){return heritageFor(d.destinationID)?.discoveries.filter(f=>s.discoveries.includes(f.id)||!!s.completed[d.levels[f.suggestedMission-1]?.id])??[];}
