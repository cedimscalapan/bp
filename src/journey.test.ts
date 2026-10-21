import {describe,it,expect} from 'vitest';
import catalogData from './data/catalog.json';
import {freshSave,parseSave,type Destination} from './model';
import {createRun,settle} from './engine';
import {achievements,claimAchievement,journeyStats,nextMission} from './journey';
const catalog=catalogData as Destination[];
const places=catalog.filter(d=>d.group==='Oriental Mindoro');
describe('Heritage journey progression',()=>{
 it('blocks unearned, unknown, and repeated reward claims',()=>{
  let save=freshSave();expect(claimAchievement(save,'first-memory',catalog)).toBe(save);expect(claimAchievement(save,'invented',catalog)).toBe(save);
  save.completed[places[0].levels[0].id]=1;
  save=claimAchievement(save,'first-memory',catalog);expect(save.coins).toBe(50);
  const restored=parseSave(JSON.stringify(save));expect(claimAchievement(restored,'first-memory',catalog)).toBe(restored);expect(restored.coins).toBe(50);
 });
 it('keeps old saves and rejects malformed claim histories',()=>{
  const old=freshSave();expect(parseSave(JSON.stringify(old)).achievementClaims).toBeUndefined();
  expect(()=>parseSave(JSON.stringify({...old,achievementClaims:'first-memory'}))).toThrow();
 });
 it('failed runs cannot earn completion milestones',()=>{
  const save=freshSave(),level=places[0].levels[0],run=createRun(level,save);run.status='lost';run.score=10000;
  expect(achievements(settle(save,level,run),catalog).some(a=>a.earned)).toBe(false);
 });
 it('counts distinct community clears, gold medals, and stamps without counting unrelated routes',()=>{
  const save=freshSave();for(const d of places.slice(0,3))save.completed[d.levels[0].id]=3;
  const other=catalog.find(d=>d.group!=='Oriental Mindoro')!;for(const l of other.levels)save.completed[l.id]=3;
  expect(journeyStats(save,catalog)).toEqual({cleared:3,gold:3,visited:3,stamps:0,total:180});
  expect(achievements(save,catalog).find(a=>a.id==='community-friend')?.earned).toBe(true);
  for(const l of places[0].levels)save.completed[l.id]=1;
  expect(journeyStats(save,catalog).stamps).toBe(1);
 });
 it('continues a started community and handles a completed campaign',()=>{
  const save=freshSave();expect(nextMission(save,catalog)?.level).toEqual(places[0].levels[0]);
  save.completed[places[2].levels[0].id]=1;expect(nextMission(save,catalog)?.level).toEqual(places[2].levels[1]);
  for(const d of places)for(const l of d.levels)save.completed[l.id]=1;
  expect(nextMission(save,catalog)).toBeNull();
 });
});
