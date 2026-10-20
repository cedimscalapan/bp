import data from './data/investigations.json';
import {emptyChallengeRecord,type ChallengeRecord} from './challengeProgress';
import type {Save} from './model';
export type Item={id:string;label:string};
export type Task={id:string;prompt:string;explanation:string}&(
 {kind:'sequence';items:Item[];answer:string[]}|
 {kind:'match';pairs:{id:string;left:string;right:string}[]}|
 {kind:'classify';items:(Item&{answer:string})[];categories:Item[]}|
 {kind:'decision';options:Item[];answer:string}|
 {kind:'budget';items:(Item&{cost:number;roles:string[]})[];budget:number;requiredRoles:string[]});
export type Investigation={id:string;placeID:string;title:string;family:string;learningObjective:string;whyHere:string;claimIDs:string[];researchNoteIDs?:string[];sourceIDs:string[];briefing:string[];designNote:string;unlock:string;success:string;failure:string;difficulty:string;reward:{coins:number;xp:number};artworkRequirements:string;tasks:Task[]};
export const investigations=data as Investigation[];
export const investigationsFor=(placeID:string)=>investigations.filter(m=>m.placeID===placeID);
export type InvestigationResult={responses:Record<string,string[]>;attempts:number;mistakes:number;hints:number;review:boolean;finished:boolean};
export function taskSolved(task:Task,response:string[]):boolean{
 if(!Array.isArray(response)||!response.every(v=>typeof v==='string'))return false;
 switch(task.kind){
  case 'sequence':return response.length===task.answer.length&&task.answer.every((id,i)=>response[i]===id);
  case 'decision':return response.length===1&&response[0]===task.answer;
  case 'match':return response.length===task.pairs.length&&task.pairs.every((p,i)=>response[i]===p.id);
  case 'classify':return response.length===task.items.length&&task.items.every((p,i)=>response[i]===p.answer);
  case 'budget':{if(new Set(response).size!==response.length)return false;const chosen=response.map(id=>task.items.find(i=>i.id===id));if(chosen.some(i=>!i))return false;return chosen.reduce((sum,i)=>sum+i!.cost,0)<=task.budget&&task.requiredRoles.every(role=>chosen.some(i=>i!.roles.includes(role)));}
 }
}
export function investigationSolved(mission:Investigation,result:InvestigationResult){return mission.tasks.every(t=>taskSolved(t,result.responses[t.id]??[]));}
export function recordInvestigation(save:Save,mission:Investigation,result:InvestigationResult):Save{
 if(![result.attempts,result.mistakes,result.hints].every(n=>Number.isSafeInteger(n)&&n>=0)||result.mistakes>result.attempts)return save;
 const old=save.investigations?.[mission.id]??emptyChallengeRecord();const solved=result.finished&&result.attempts>=mission.tasks.length&&investigationSolved(mission,result);const first=solved&&old.completions===0;
 const record:ChallengeRecord={attempts:old.attempts+result.attempts,mistakes:old.mistakes+result.mistakes,hints:old.hints+result.hints,completions:old.completions+(solved?1:0),unassistedCompletions:old.unassistedCompletions+(solved&&result.hints===0&&result.mistakes===0?1:0),reviews:old.reviews+(result.review?1:0),lastPlayed:new Date().toISOString()};
 return {...save,coins:save.coins+(first?mission.reward.coins:0),xp:save.xp+(first?mission.reward.xp:0),investigations:{...save.investigations,[mission.id]:record}};
}
export function hasInvestigationSeal(save:Save,placeID:string){const missions=investigationsFor(placeID);return missions.length>0&&missions.every(m=>(save.investigations?.[m.id]?.completions??0)>0);}
