import type { Level, Save } from './model';
export type ItemKind='coin'|'star'|'signature'|'obstacle'|'hazard'|'heart';
export type Item={id:number;lane:number;y:number;kind:ItemKind};
export type Run={time:number;lane:number;hearts:number;score:number;coins:number;stars:number;signature:number;damage:number;dodges:number;combo:number;bestCombo:number;items:Item[];spawn:number;nextId:number;shield:number;magnet:number;double:number;slow:number;cooldown:number;invincible:number;status:'running'|'won'|'lost';endless:boolean;shieldHits:number;counterHits:number;magnetPickups:number;doublePickups:number;instinct:number;rush:number;revived:boolean;catRescue:boolean;showers:number;turtleCharges:number;turtleCooldown:number};
export function createRun(l:Level,s:Save,endless=false):Run{return {time:0,lane:1,hearts:l.lives,score:0,coins:0,stars:0,signature:0,damage:0,dodges:0,combo:0,bestCombo:0,items:[],spawn:.3,nextId:0,shield:0,magnet:0,double:0,slow:0,cooldown:0,invincible:0,status:'running',endless,shieldHits:0,counterHits:0,magnetPickups:0,doublePickups:0,instinct:0,rush:0,revived:false,catRescue:false,showers:0,turtleCharges:2,turtleCooldown:0};}
export function objective(l:Level,r:Run):{value:number;target:number;label:string}{
 const m=l.mission;const v:Record<string,[number,string]>={collectCoins:[r.coins,'Travel Coins'],collectStars:[r.stars,'Travel Stars'],collectSignatureItems:[r.signature,'keepsakes'],collectAndSurvive:[r.signature,'keepsakes'],survive:[Math.floor(r.time),'seconds'],reachScore:[r.score,'score'],scoreWithDamageLimit:[r.score,'score'],troublemakerChallenge:[r.dodges,'hazards dodged'],comboStreak:[r.bestCombo,'combo']};
 const [value,label]=v[m.type]??[0,'unsupported objective'];return {value,target:m.target,label};
}
export function missionWon(l:Level,r:Run){const m=l.mission;return objective(l,r).value>=m.target&&(m.maximumDamage===undefined||r.damage<=m.maximumDamage)&&(m.type!=='collectAndSurvive'||r.time>=(m.secondaryTarget??0));}
export function activate(r:Run,id:string,buddy='cat'):Run {
 const n={...r,items:[...r.items]};
 switch(id){
 case 'forcefield':n.shieldHits=5;break; case 'treasure_magnet':n.magnetPickups=15;break;case 'lucky_star':n.doublePickups=10;break;case 'buddy_instinct':n.instinct=20;break;
 case 'buddy_rush':n.rush=12;break;
 case 'paw_burst':n.items=n.items.filter(i=>!['hazard','obstacle'].includes(i.kind));break;
 case 'paw_counter':n.counterHits=3;break;
 case 'skill':
  if(n.cooldown>0||buddy==='cat')return r;
  n.cooldown=18;
  if(buddy==='penguin')n.slow=4;
  else if(buddy==='cat'){n.hearts=Math.min(5,n.hearts+1);n.catRescue=true;n.shield=2;}
  else if(buddy==='pig'){const i=n.items.find(i=>i.kind==='hazard');if(i)n.items=n.items.map(v=>v.id===i.id?{...v,kind:'coin'}:v);}
  else if(['bear','bunny','monkey'].includes(buddy))n.shield=4;
  else {n.shield=2;n.items=n.items.filter(i=>i.lane!==r.lane||!['hazard','obstacle'].includes(i.kind));}
 }
 return n;
}
export function step(run:Run,delta:number,l:Level,s:Save,random= Math.random):Run {
 if(run.status!=='running')return run;
 const dt=Math.min(Math.max(delta,0),.05);const r={...run,items:run.items.map(i=>({...i})),time:run.time+dt};
 for(const k of ['shield','magnet','double','slow','cooldown','invincible','instinct','rush','turtleCooldown'] as const)r[k]=Math.max(0,r[k]-dt);
 r.spawn-=dt;
 if(r.spawn<=0){
  const difficulty=r.endless?1+r.time/100:1; r.spawn=Math.max(.25,.65*l.spawnIntervalMultiplier/difficulty);
  const x=random();const hazardRate=l.isFinalChallenge?Math.max(.25,l.hazardFrequency):l.hazardFrequency;
  const kind:ItemKind=x<hazardRate?'hazard':x<hazardRate+l.obstacleDensity*.35?'obstacle':x<.62?'coin':x<.78?'signature':x<.96?'star':'heart';
  r.items.push({id:r.nextId++,lane:Math.min(2,Math.floor(random()*3)),y:-.1,kind});
 }
 const speed=.32*l.speedMultiplier*(r.endless?1+r.time/160:1)*(r.slow>0?.55:1)*(r.rush>0?1.2:1);
 const showerLimit=s.companion==='coin_gecko'?5:s.companion==='scout_bird'?3:0;
 if(r.showers<showerLimit&&r.time>=(r.showers+1)*8){const kind=s.companion==='coin_gecko'?'coin':'star';const count=kind==='coin'?10:7;for(let i=0;i<count;i++)r.items.push({id:r.nextId++,lane:i%3,y:-.1-i*.065,kind});r.showers++;}
 const remaining:Item[]=[];
 for(const item of r.items){
  const prev=item.y;item.y+=dt*speed;
  if(prev<.82&&item.y>=.82){
   const threat=item.kind==='obstacle'||item.kind==='hazard';
   if(threat&&s.companion==='guard_turtle'&&r.turtleCharges>0&&r.turtleCooldown<=0){r.turtleCharges--;r.turtleCooldown=30;r.dodges++;continue;}
   if(r.instinct>0){if(threat&&item.lane===r.lane)r.lane=(r.lane+1)%3;else if(!threat)r.lane=item.lane;}
   const hit=item.lane===r.lane||(!threat&&(r.magnet>0||r.magnetPickups>0));
   if(hit){
    if(threat){if(r.shieldHits>0){r.shieldHits--;r.dodges++;}else if(item.kind==='hazard'&&r.counterHits>0){r.counterHits--;r.dodges++;r.score+=50;}else if(r.shield<=0&&r.invincible<=0){r.hearts--;r.damage++;r.combo=0;r.invincible=1.2;}else r.dodges++;}
    else {r.combo++;r.bestCombo=Math.max(r.bestCombo,r.combo);const multiplier=r.doublePickups>0||r.double>0?2:1;if(r.doublePickups>0)r.doublePickups--;if(r.magnetPickups>0)r.magnetPickups--;
     if(item.kind==='coin'){r.coins+=multiplier;r.score+=50*multiplier;}
     if(item.kind==='star'){r.stars+=multiplier;r.score+=100*multiplier;}
     if(item.kind==='signature'){r.signature+=multiplier;r.score+=150*multiplier;}
     if(item.kind==='heart')r.hearts=Math.min(5,r.hearts+1);
    }
    continue;
   }else if(threat){r.dodges++;r.score+=20;}else r.combo=0;
  }
  if(item.y<1.15)remaining.push(item);
 }
 r.items=remaining;
 if(r.hearts<=0&&s.companion==='medic_otter'&&!r.revived){r.hearts=1;r.revived=true;r.invincible=3;}
 if(r.hearts<=0&&s.buddy==='cat'&&!r.catRescue){r.hearts=1;r.catRescue=true;r.invincible=3;}
 if(r.hearts<=0||(l.mission.maximumDamage!==undefined&&r.damage>l.mission.maximumDamage))r.status='lost';
 else if(!r.endless&&missionWon(l,r))r.status='won';
 else if(!r.endless&&r.time>=l.mission.timeLimit)r.status='lost';
 return r;
}
export function settle(s:Save,l:Level,r:Run):Save {
 const won=r.status==='won';const first=won&&!s.completed[l.id];const stars= r.score>=l.threeStarScore?3:r.score>=l.twoStarScore?2:1;
 const xp=first?l.rewardTravelerXP:won?0:Math.floor(l.rewardTravelerXP*l.failureXPFactor);
 return {...s,coins:s.coins+r.coins,xp:s.xp+xp,completed:won?{...s.completed,[l.id]:Math.max(stars,s.completed[l.id]??0)}:s.completed,destinationXP:{...s.destinationXP,[l.destinationID]:(s.destinationXP[l.destinationID]??0)+(first?l.rewardDestinationXP:0)},best:{...s.best,[l.destinationID]:Math.max(r.score,s.best[l.destinationID]??0)},daily:{...s.daily,coins:s.daily.coins+r.coins,runs:s.daily.runs+1},weekly:{...s.weekly,runs:s.weekly.runs+1}};
}
