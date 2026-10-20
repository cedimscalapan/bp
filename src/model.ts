import { freshLearning, validLearning, type LearningProgress } from './learning';
export type Mission = { type: string; target: number; timeLimit: number; secondaryTarget?: number; minimumKeepsakes?:number; maximumDamage?: number };
export type Level = { id: string; destinationID: string; number: number; title: string; mission: Mission; lives: number; speedMultiplier: number; spawnIntervalMultiplier: number; obstacleDensity: number; hazardFrequency: number; rewardTravelerXP: number; rewardDestinationXP: number; oneStarScore: number; twoStarScore: number; threeStarScore: number; failureXPFactor: number; isFinalChallenge: boolean };
export type Destination = { destinationID: string; name: string; group: string; image: string; signatureItemName: string; signatureImage: string; levels: Level[]; recovered: boolean; custom?: boolean; localityType?: string; sourceUrl?: string };
export type Buddy = { id: string; name: string; skill: string; description: string };
export const buddies: Buddy[] = [
 {id:'cat',name:'Cat',skill:'Nine Lives',description:'Survive one fatal hit per run with one heart and brief protection.'},
 {id:'dog',name:'Dog',skill:'Bone Toss',description:'Interrupt incoming trouble.'},
 {id:'bunny',name:'Bunny',skill:'Carrot Decoy',description:'Distract threats for a brief escape.'},
 {id:'pig',name:'Pig',skill:'Lucky Trade',description:'Turn a nearby hazard into a Travel Coin.'},
 {id:'penguin',name:'Penguin',skill:'Ice Pause',description:'Freeze incoming danger briefly.'},
 {id:'bear',name:'Bear',skill:'Brace',description:'Brace against an incoming hit.'},
 {id:'monkey',name:'Monkey',skill:'Vine Swing',description:'Swing out of danger with brief protection.'},
 {id:'owl',name:'Owl',skill:'Feather Return',description:'Return a flying projectile and stun its attacker.'},
 {id:'rhino',name:'Rhino',skill:'Rhino Charge',description:'Charge through danger and clear your lane.'}
];
export const powerups = [
 {id:'forcefield',name:'Buddy Forcefield',price:200,description:'Blocks 5 dangerous hits and repels hazards.'},
 {id:'treasure_magnet',name:'Treasure Magnet',price:120,description:'Attracts the next 15 coins, stars, and destination items.'},
 {id:'buddy_rush',name:'Buddy Rush',price:220,description:'Move faster and reach rewards more easily for 12 seconds.'},
 {id:'lucky_star',name:'Lucky Star',price:130,description:'The next 10 eligible rewards count twice.'},
 {id:'paw_burst',name:'Heritage Burst',price:160,description:'Clears active danger and knocks Troublemakers away.'},
 {id:'paw_counter',name:'Guardian Counter',price:180,description:'Catches and reflects the next 3 enemy projectiles.'},
 {id:'buddy_instinct',name:'Buddy Instinct',price:260,description:'Automatically dodges danger and catches rewards for 20 seconds.'}
];
export const companions = [
 {id:'coin_gecko',name:'Coin Gecko',price:2200,description:'Uncovers five bonus showers of 10 Travel Coins per mission.'},
 {id:'guard_turtle',name:'Guard Turtle',price:2800,description:'Cages up to 2 peeking enemies before they fire, with a 30-second recharge.'},
 {id:'medic_otter',name:'Medic Otter',price:3400,description:'Saves your Buddy from a knockout once per mission, returning with 1 Life.'},
 {id:'scout_bird',name:'Star Scout',price:1600,description:'Calls three bonus showers of 7 Travel Stars per mission.'}
];
export type Save = {learning:LearningProgress;discoveries:string[]; recaps:string[]; careBadges:string[]; version:1; name:string; buddy:string; coins:number; xp:number; completed:Record<string,number>; destinationXP:Record<string,number>; ownedCompanions:string[]; companion:string; powerups:Record<string,number>; upgrades:Record<string,number>; outfit:string; best:Record<string,number>; daily:{date:string; coins:number; runs:number; claimed:boolean}; weekly:{week:string; runs:number; claimed:boolean}; settings:{music:boolean;sound:boolean}; welcomed:boolean; onboarded:boolean};
export const dayKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const weekKey = () => { const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-((d.getDay()+6)%7)); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; };
export function freshSave():Save {return {learning:freshLearning(),discoveries:[],recaps:[],careBadges:[],version:1,name:'Traveler',buddy:'cat',coins:0,xp:0,completed:{},destinationXP:{},ownedCompanions:[],companion:'',powerups:{},upgrades:{},outfit:'#e6a85a',best:{},daily:{date:dayKey(),coins:0,runs:0,claimed:false},weekly:{week:weekKey(),runs:0,claimed:false},settings:{music:true,sound:true},welcomed:false,onboarded:false};}
export function rotateGoals(s:Save):Save {return {...s,daily:s.daily.date===dayKey()?s.daily:freshSave().daily,weekly:s.weekly.week===weekKey()?s.weekly:freshSave().weekly};}
export function parseSave(raw:string|null):Save {if(!raw)return freshSave();try{const s=JSON.parse(raw); if(s.version!==1||typeof s.name!=='string'||!buddies.some(b=>b.id===s.buddy)||!Number.isFinite(s.coins)||s.coins<0||!Number.isFinite(s.xp)||s.xp<0||!s.daily||!s.weekly)throw Error('Invalid save');for(const key of ['completed','destinationXP','powerups','upgrades','best']){if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key])||!Object.values(s[key]).every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0))throw Error('Invalid progress');}if(!Array.isArray(s.ownedCompanions)||!s.settings||typeof s.settings.music!=='boolean'||typeof s.settings.sound!=='boolean')throw Error('Invalid settings');for(const key of ['discoveries','recaps','careBadges']){if(s[key]!==undefined&&(!Array.isArray(s[key])||!s[key].every((id:unknown)=>typeof id==='string')))throw Error('Invalid heritage progress');}if(s.learning!==undefined&&!validLearning(s.learning))throw Error('Invalid learning progress');return rotateGoals({...freshSave(),...s});}catch{throw new Error('The saved data could not be read. Restore a valid backup or reset from Settings.');}}
export function isLevelOpen(d:Destination,l:Level,s:Save){return l.number===1 || (s.completed[d.levels[l.number-2]?.id]??0)>0;}
export function buy(s:Save,kind:'powerup'|'companion'|'upgrade',id:string):Save {
 const product=kind==='powerup'?powerups.find(p=>p.id===id):kind==='companion'?companions.find(p=>p.id===id):buddies.find(b=>b.id===id);
 if(!product) return s;
 if(kind==='companion'&&s.ownedCompanions.includes(id))return {...s,companion:id};
 const count=s.upgrades[id]??0;if(kind==='upgrade'&&count>=3)return s;
 const cost=kind==='upgrade'?150*(count+1):('price' in product?product.price:0); if(s.coins<cost)return s;
 return {...s,coins:s.coins-cost,...(kind==='powerup'?{powerups:{...s.powerups,[id]:(s.powerups[id]??0)+1}}:kind==='companion'?{ownedCompanions:[...s.ownedCompanions,id],companion:id}:{upgrades:{...s.upgrades,[id]:count+1}})};
}
