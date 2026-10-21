import { destinationStamped, isLevelOpen, type Destination, type Save } from './model';

export function journeyStats(save:Save, catalog:Destination[]) {
 const places=catalog.filter(d=>d.group==='Oriental Mindoro');
 const levels=places.flatMap(d=>d.levels);
 return {
  cleared:levels.filter(l=>(save.completed[l.id]??0)>0).length,
  gold:levels.filter(l=>(save.completed[l.id]??0)>=3).length,
  visited:places.filter(d=>d.levels.some(l=>(save.completed[l.id]??0)>0)).length,
  stamps:places.filter(d=>destinationStamped(d,save)).length,
  total:levels.length,
 };
}
export function achievements(save:Save,catalog:Destination[]) {
 const stats=journeyStats(save,catalog);
 return [
  {id:'first-memory',icon:'✦',title:'First memory',description:'Clear your first community runner mission.',value:stats.cleared,target:1,reward:50},
  {id:'trail-builder',icon:'◆',title:'Trail builder',description:'Clear 5 different community missions.',value:stats.cleared,target:5,reward:100},
  {id:'community-friend',icon:'♡',title:'Community friend',description:'Clear a mission in 3 different communities.',value:stats.visited,target:3,reward:150},
  {id:'golden-traveler',icon:'★',title:'Golden traveler',description:'Earn 3 stars in 3 community missions.',value:stats.gold,target:3,reward:150},
  {id:'passport-keeper',icon:'▧',title:'Passport keeper',description:'Earn a community passport stamp.',value:stats.stamps,target:1,reward:200},
  {id:'heritage-explorer',icon:'❖',title:'Heritage explorer',description:'Clear 15 different community missions.',value:stats.cleared,target:15,reward:250},
 ].map(a=>({...a,value:Math.min(a.value,a.target),earned:a.value>=a.target,claimed:save.achievementClaims?.includes(a.id)??false}));
}
export function claimAchievement(save:Save,id:string,catalog:Destination[]):Save {
 const badge=achievements(save,catalog).find(a=>a.id===id);
 if(!badge?.earned||badge.claimed)return save;
 return {...save,coins:save.coins+badge.reward,achievementClaims:[...(save.achievementClaims??[]),id]};
}
export function nextMission(save:Save,catalog:Destination[]) {
 const places=catalog.filter(d=>d.group==='Oriental Mindoro');
 const active=places.filter(d=>d.levels.some(l=>(save.completed[l.id]??0)>0));
 for(const destination of [...active,...places.filter(d=>!active.includes(d))]){
  const level=destination.levels.find(l=>!(save.completed[l.id]>0)&&isLevelOpen(destination,l,save));
  if(level)return {destination,level};
 }
 return null;
}
