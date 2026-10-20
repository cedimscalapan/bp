import { describe, it, expect } from 'vitest';
import { createRun, step, missionWon, settle, activate, objective } from './engine';
import { buy, freshSave, parseSave, isLevelOpen, rotateGoals, type Level, type Destination } from './model';
import catalogData from './data/catalog.json';
import local from './data/local_adventure.json';
import international from './data/international_adventure.json';
const catalog=catalogData as Destination[];const d=catalog[0];const l=d.levels[0];
describe('Recovered data',()=>{
 it('preserves all 115 International mission definitions',()=>{for(const dest of international.destinations){expect(catalog.find(d=>d.recovered&&d.destinationID===dest.destinationID)?.levels).toEqual(dest.levels);}expect(catalog.filter(d=>d.recovered).flatMap(d=>d.levels)).toHaveLength(115);});
 it('includes Calapan City and exactly the 14 municipalities',()=>{const places=catalog.filter(d=>d.group==='Oriental Mindoro');expect(places.map(d=>d.name).sort()).toEqual(['Calapan City','Baco','Bansud','Bongabong','Bulalacao','Gloria','Mansalay','Naujan','Pinamalayan','Pola','Puerto Galera','Roxas','San Teodoro','Socorro','Victoria'].sort());expect(places.filter(d=>d.localityType==='City')).toHaveLength(1);expect(places.filter(d=>d.localityType==='Municipality')).toHaveLength(14);expect(catalog.filter(d=>d.group==='Local')).toHaveLength(0);for(const d of places){expect(d.levels).toHaveLength(12);for(const l of d.levels){expect(l.destinationID).toBe(d.destinationID);expect(l.id.startsWith(d.destinationID+'_')).toBe(true);}}});
 it('has unique level IDs and supports all objectives',()=>{const ids=catalog.flatMap(d=>d.levels.map(l=>l.id));expect(new Set(ids).size).toBe(ids.length);for(const dest of catalog)for(const level of dest.levels)expect(objective(level,createRun(level,freshSave())).label).not.toBe('unsupported objective');});
});
describe('Runner',()=>{
 it('collects a coin exactly once on crossing the player',()=>{const s=freshSave();let r=createRun(l,s);r.items=[{id:1,lane:1,y:.815,kind:'coin'}];r.spawn=10;r=step(r,.05,l,s);expect(r.coins).toBe(1);expect(r.score).toBe(50);expect(step(r,.05,l,s).coins).toBe(1);});
 it('damages the player for a threat and grants brief immunity',()=>{const s=freshSave();let r=createRun(l,s);r.items=[{id:1,lane:1,y:.815,kind:'hazard'},{id:2,lane:1,y:.815,kind:'obstacle'}];r.spawn=10;r=step(r,.05,l,s);expect(r.hearts).toBe(2);expect(r.damage).toBe(1);});
 it('counts a hazard dodge in another lane',()=>{const s=freshSave();const r=createRun(l,s);r.items=[{id:1,lane:0,y:.815,kind:'hazard'}];expect(step(r,.05,l,s).dodges).toBe(1);});
 it('honors shields and the magnet',()=>{const s=freshSave();let r=activate(activate(createRun(l,s),'forcefield'),'treasure_magnet');r.items=[{id:1,lane:0,y:.815,kind:'coin'},{id:2,lane:1,y:.815,kind:'hazard'}];r=step(r,.05,l,s);expect(r.coins).toBe(1);expect(r.hearts).toBe(3);});
 it('requires both keepsakes and survival time',()=>{const level={...l,mission:{type:'collectAndSurvive',target:5,timeLimit:55,secondaryTarget:30}};const r=createRun(level,freshSave());r.signature=5;r.time=29;expect(missionWon(level,r)).toBe(false);r.time=30;expect(missionWon(level,r)).toBe(true);});
 it('rejects too much damage even when score is met',()=>{const level={...l,mission:{type:'scoreWithDamageLimit',target:1500,timeLimit:60,maximumDamage:1}};const r=createRun(level,freshSave());r.score=2000;r.damage=2;expect(missionWon(level,r)).toBe(false);});
 it('wins survival at the deadline before timeout evaluation',()=>{const level={...l,mission:{type:'survive',target:10,timeLimit:10}};const r=createRun(level,freshSave());r.time=9.99;r.spawn=10;expect(step(r,.02,level,freshSave()).status).toBe('won');});
 it('times out failed objectives',()=>{const r=createRun(l,freshSave());r.time=l.mission.timeLimit-.01;r.spawn=10;expect(step(r,.02,l,freshSave()).status).toBe('lost');});
 it('continues endless play past the mission deadline',()=>{const r=createRun(l,freshSave(),true);r.time=300;r.spawn=10;expect(step(r,.02,l,freshSave()).status).toBe('running');});
 it('clamps long frame deltas after resume',()=>{const r=createRun(l,freshSave());expect(step(r,300,l,freshSave()).time).toBe(.05);});
 it('does not mutate prior frame state',()=>{const s=freshSave();const r=createRun(l,s);r.items=[{id:1,lane:1,y:.1,kind:'star'}];const before=JSON.stringify(r);step(r,.05,l,s);expect(JSON.stringify(r)).toBe(before);});
 it('enforces skill cooldown',()=>{const r=activate(createRun(l,freshSave()),'skill','dog');expect(r.cooldown).toBe(18);expect(activate(r,'skill')).toBe(r);});
 it('applies companion bonuses',()=>{const s={...freshSave(),companion:'medic_otter'};const r=createRun(l,s);r.hearts=1;r.items=[{id:1,lane:1,y:.815,kind:'hazard'}];const next=step(r,.05,l,s);expect(next.hearts).toBe(1);expect(next.revived).toBe(true);});
});
describe('Progress and transactions',()=>{
 it('requires previous level completion',()=>{const s=freshSave();expect(isLevelOpen(d,d.levels[1],s)).toBe(false);s.completed[l.id]=1;expect(isLevelOpen(d,d.levels[1],s)).toBe(true);});
 it('awards first-clear XP once and never lowers earned stars',()=>{let s=freshSave();const r=createRun(l,s);r.status='won';r.score=l.threeStarScore;r.coins=15;s=settle(s,l,r);expect(s.xp).toBe(l.rewardTravelerXP);expect(s.completed[l.id]).toBe(3);r.score=0;s=settle(s,l,r);expect(s.xp).toBe(l.rewardTravelerXP);expect(s.coins).toBe(30);expect(s.completed[l.id]).toBe(3);});
 it('cannot purchase without funds',()=>{const s=freshSave();expect(buy(s,'powerup','forcefield')).toBe(s);});
 it('charges once for a permanent companion',()=>{let s={...freshSave(),coins:3000};s=buy(s,'companion','coin_gecko');expect(s.coins).toBe(800);s=buy(s,'companion','coin_gecko');expect(s.coins).toBe(800);expect(s.ownedCompanions).toEqual(['coin_gecko']);});
 it('caps upgrades',()=>{let s={...freshSave(),coins:5000};for(let i=0;i<5;i++)s=buy(s,'upgrade','cat');expect(s.upgrades.cat).toBe(3);expect(s.coins).toBe(4100);});
 it('rejects malformed backups rather than silently destroying data',()=>{expect(()=>parseSave('{')).toThrow();expect(()=>parseSave(JSON.stringify({...freshSave(),coins:-5}))).toThrow();expect(()=>parseSave(JSON.stringify({...freshSave(),powerups:{forcefield:'unlimited'}}))).toThrow();});
 it('round-trips a save',()=>{const s=freshSave();expect(parseSave(JSON.stringify(s))).toEqual(s);});
 it('rolls over daily and weekly goals',()=>{const s=freshSave();s.daily={date:'2000-01-01',runs:3,coins:80,claimed:true};s.weekly={week:'old',runs:8,claimed:true};const n=rotateGoals(s);expect(n.daily.coins).toBe(0);expect(n.weekly.runs).toBe(0);});
});
