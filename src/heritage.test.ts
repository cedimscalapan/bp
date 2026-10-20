import { describe, it, expect } from 'vitest';
import catalogData from './data/catalog.json';
import { freshSave, parseSave, type Destination } from './model';
import { createRun } from './engine';
import { heritageProfiles, heritageSources, journalUnlocked, learnedDiscoveries, recordDiscovery } from './heritage';
const catalog=catalogData as Destination[];
const d=catalog.find(d=>d.destinationID==='oriental_mindoro_victoria')!;
describe('Heritage progress',()=>{
 it('upgrades an old backup without losing completed missions or coins',()=>{const s=freshSave();s.coins=238;s.completed[d.levels[1].id]=2;const legacy=JSON.parse(JSON.stringify(s));delete legacy.discoveries;delete legacy.recaps;delete legacy.careBadges;const upgraded=parseSave(JSON.stringify(legacy));expect(upgraded.coins).toBe(238);expect(upgraded.completed).toEqual(s.completed);expect(upgraded.discoveries).toEqual([]);expect(learnedDiscoveries(d,upgraded)).toHaveLength(1);});
 it('retains discoveries after failed runs without awarding a care badge',()=>{const s=freshSave();const l=d.levels[3];const r={...createRun(l,s),status:'lost' as const};const next=recordDiscovery(s,d,l,r);expect(next.discoveries).toContain('victoria_discovery_4');expect(next.careBadges).toEqual([]);expect(recordDiscovery(next,d,l,r).discoveries).toHaveLength(1);});
 it('awards a care badge only for a successful no-hit fourth mission',()=>{const s=freshSave();const l=d.levels[3];const won={...createRun(l,s),status:'won' as const};expect(recordDiscovery(s,d,l,won).careBadges).toContain(d.destinationID);expect(recordDiscovery(s,d,l,{...won,damage:1}).careBadges).toEqual([]);expect(recordDiscovery(s,d,d.levels[0],won).careBadges).toEqual([]);});
 it('unlocks the journal through mission five regardless of recap',()=>{const s=freshSave();s.completed[d.levels[0].id]=3;expect(journalUnlocked(d,s)).toBe(false);s.completed[d.levels[4].id]=1;expect(journalUnlocked(d,s)).toBe(true);expect(s.recaps).toEqual([]);});
 it('rejects malformed heritage progress in a backup',()=>{expect(()=>parseSave(JSON.stringify({...freshSave(),recaps:'bad'}))).toThrow();});
});
describe('Applied research coverage',()=>{
 it('connects all 75 local missions to sourced discoveries and valid optional recaps',()=>{expect(heritageProfiles).toHaveLength(15);const sources=new Set(heritageSources.map(s=>s.id));for(const p of heritageProfiles){const dest=catalog.find(d=>d.destinationID===p.destinationID)!;expect(dest).toBeDefined();expect(p.discoveries.map(f=>f.suggestedMission)).toEqual([1,2,3,4,5]);for(const f of p.discoveries)for(const id of f.sourceIDs)expect(sources.has(id)).toBe(true);expect(p.recap.options[p.recap.correctOptionIndex]).toBeTruthy();expect(dest.signatureImage).toBe(p.pickupImage);}});
});

it('ships five community topics and only aggregate barangay data for every place',()=>{
 expect(heritageProfiles.reduce((sum,p)=>sum+p.barangayCount,0)).toBe(426);
 for(const p of heritageProfiles){
  expect(p.discoveries.map(f=>f.category)).toEqual(['history','barangays','livelihoods','traditions','environment']);
  expect(p.discoveries[1].text).toContain(`${p.barangayCount} barangays`);
  expect(p).not.toHaveProperty('barangays');
  expect(p).not.toHaveProperty('barangayNames');
  expect(p.journal.text).not.toMatch(/tourist|attraction|museum stop|island visit|cave photograph/i);
 }
});
