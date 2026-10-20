export type ChallengeRecord={attempts:number;mistakes:number;hints:number;completions:number;unassistedCompletions:number;reviews:number;lastPlayed:string};
export function validChallengeRecords(value:unknown):value is Record<string,ChallengeRecord>{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>1000)return false;
 return Object.entries(value).every(([id,r])=>id.length<=120&&r&&typeof r==='object'&&['attempts','mistakes','hints','completions','unassistedCompletions','reviews'].every(k=>Number.isSafeInteger((r as Record<string,unknown>)[k])&&Number((r as Record<string,unknown>)[k])>=0)&&r.mistakes<=r.attempts&&r.completions<=r.attempts&&r.unassistedCompletions<=r.completions&&typeof r.lastPlayed==='string'&&!Number.isNaN(Date.parse(r.lastPlayed)));
}
export const emptyChallengeRecord=():ChallengeRecord=>({attempts:0,mistakes:0,hints:0,completions:0,unassistedCompletions:0,reviews:0,lastPlayed:new Date().toISOString()});
