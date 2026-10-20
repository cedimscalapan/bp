export const languageSource='https://s3.us-west-2.amazonaws.com/ierc-v2-publicfiles/public/public/resources/PhilEdData_Firth_Toolkit_formatted_10.pdf';
export const scriptSource='https://www.unicode.org/charts/PDF/U1720.pdf';
// Small sourced starter lexicon, not a sentence translator. Filipino glosses
// correspond to the toolkit's parallel Tagalog row. Preserve source spelling.
export const words=[
 {id:'danum',hanunoo:'danum',filipino:'tubig'},
 {id:'ulu',hanunoo:'ulu',filipino:'ulo'},
 {id:'butul',hanunoo:'butul',filipino:'buto'},
 {id:'tawu',hanunoo:'tawu',filipino:'tao'},
 {id:'kuti',hanunoo:'kuti',filipino:'pusa'},
 {id:'yabi',hanunoo:'yabi',filipino:'gabi'},
];
export const characters=['a','i','u','ka','ga','nga','ta','da','na','pa','ba','ma','ya','ra','la','wa','sa','ha'].map((name,i)=>({id:`letter-${name}`,name,glyph:String.fromCodePoint(0x1720+i)}));
export const normalizeWord=(s:string)=>s.normalize('NFC').trim().toLocaleLowerCase();
export function lookupWord(input:string,direction:'hanunoo'|'filipino'){return words.find(w=>normalizeWord(w[direction])===normalizeWord(input));}
export type Point={x:number;y:number};
export type Drawing={id:string;target:string;kind:'character'|'word';strokes:Point[][];savedAt:string};
export type LearningProgress={bookmarks:string[];practiced:string[];attempts:number;correct:number;drawings:Drawing[]};
export const freshLearning=():LearningProgress=>({bookmarks:[],practiced:[],attempts:0,correct:0,drawings:[]});
export function validLearning(v:unknown):v is LearningProgress {
 if(!v||typeof v!=='object')return false;
 const p=v as LearningProgress;
 return ['bookmarks','practiced'].every(k=>Array.isArray(p[k as 'bookmarks'])&&p[k as 'bookmarks'].length<=100&&p[k as 'bookmarks'].every(id=>typeof id==='string'&&id.length<=80))&&Number.isSafeInteger(p.attempts)&&p.attempts>=0&&Number.isSafeInteger(p.correct)&&p.correct>=0&&p.correct<=p.attempts&&Array.isArray(p.drawings)&&p.drawings.length<=12&&p.drawings.every(d=>d&&typeof d.id==='string'&&d.id.length<=80&&typeof d.target==='string'&&d.target.length<=80&&['character','word'].includes(d.kind)&&typeof d.savedAt==='string'&&Array.isArray(d.strokes)&&d.strokes.length<=80&&d.strokes.every(s=>Array.isArray(s))&&d.strokes.reduce((n,s)=>n+s.length,0)<=1500&&d.strokes.every(s=>Array.isArray(s)&&s.every(pt=>pt&&Number.isFinite(pt.x)&&Number.isFinite(pt.y)&&pt.x>=0&&pt.x<=600&&pt.y>=0&&pt.y<=280)));
}
