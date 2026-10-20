import {describe,it,expect} from 'vitest';
import catalog from './data/catalog.json';
import {heritageProfiles} from './heritage';
import {communityQuestion} from './communityQuestions';
import {createRun,missionWon,step} from './engine';
import {freshSave,type Destination} from './model';
const places=(catalog as Destination[]).filter(d=>d.group==='Oriental Mindoro');
describe('Purposeful community missions',()=>{
 it('connects all 75 missions to unique, sourced questions and required local keepsakes',()=>{
  for(const p of heritageProfiles)for(let n=1;n<=5;n++){
   const q=communityQuestion(p.destinationID,n,4)!;expect(q).toBeTruthy();expect(q.options).toContain(q.answer);expect(new Set(q.options).size).toBe(4);expect(q.fact.sourceIDs.length).toBeGreaterThan(0);
   const d=places.find(d=>d.destinationID===p.destinationID)!;const l=d.levels[n-1];const r=createRun(l,freshSave());r.coins=999;r.score=99999;r.signature=0;r.dodges=999;r.time=45;expect(missionWon(l,r)).toBe(false);r.signature=99;expect(missionWon(l,r)).toBe(true);
  }
 });
 it('allows every mission to be completed with careful play within its deadline',()=>{
  for(const [index,d] of places.entries())for(const l of d.levels){
   let seed=1+index*17+l.number;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const save=freshSave();let run=createRun(l,save);
   while(run.status==='running'){
    const imminent=run.items.filter(i=>i.y>.65&&i.y<.82).sort((a,b)=>b.y-a.y);
    const threats=imminent.filter(i=>i.kind==='hazard'||i.kind==='obstacle');const safe=[0,1,2].filter(lane=>!threats.some(i=>i.lane===lane));
    const reward=imminent.find(i=>i.kind!=='hazard'&&i.kind!=='obstacle'&&safe.includes(i.lane));
    run={...run,lane:reward?.lane??(safe.includes(run.lane)?run.lane:safe[0]??run.lane)};
    run=step(run,.05,l,save,random);
   }
   expect(run.status,`${d.name} mission ${l.number}: coins ${run.coins}, keepsakes ${run.signature}, dodges ${run.dodges}, damage ${run.damage}`).toBe('won');
  }
 });
});
