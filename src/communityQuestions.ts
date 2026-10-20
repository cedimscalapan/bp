import historyRunners from './data/runner-history.json';
import { communityPrompts } from './communityPrompts';
import { heritageFor } from './heritage';
export function communityQuestion(destinationID:string,mission:number,optionCount=3){
 const p=heritageFor(destinationID);const fact=p?.discoveries.find(f=>f.suggestedMission===mission);if(!p||!fact)return null;
 if(mission>5){const entry=historyRunners.find(f=>f.placeID===destinationID&&f.suggestedMission===mission);if(!entry)return null;return {question:entry.question,options:[entry.answer,...entry.options.filter(option=>option!==entry.answer).slice(0,optionCount-1)].sort(),answer:entry.answer,fact};}
 if(mission===2){const counts=[p.barangayCount,p.barangayCount+3,Math.max(1,p.barangayCount-4),p.barangayCount+9].slice(0,optionCount);const options=counts.map(n=>`${n} barangays`).sort();return {question:`How many barangays does ${p.name} have in the PSA record dated ${p.barangayCountAsOf}?`,options,answer:`${p.barangayCount} barangays`,fact};}
 const prompt=communityPrompts[p.name]?.[mission];
 if(!prompt)return null;
 const [question,answer]=prompt;
 const alternatives=[...new Set(Object.values(communityPrompts).flatMap(row=>row[mission]?[row[mission][1]]:[]))].filter(value=>value!==answer);
 const offset=p.name.length%alternatives.length;
 const options=[answer,...[...alternatives.slice(offset),...alternatives.slice(0,offset)].slice(0,optionCount-1)].sort();
 return {question:`${p.name}: ${question}`,options,answer,fact};
}
