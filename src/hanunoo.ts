import { characters } from './learning';

export const hanunooSources=[
 {id:'unicode',title:'Unicode Consortium · Hanunoo chart',url:'https://unicode.org/charts/PDF/U1720.pdf',use:'Character codes, base letters, vowel signs and pamudpod.'},
 {id:'ishida',title:'Richard Ishida · Hanunó’o Orthography Notes',url:'https://r12a.github.io/scripts/hano/hnn.html',use:'Modern printed spelling, vowel combinations and consonant endings.'},
 {id:'loc',title:'Library of Congress · Mangyan Bamboo Collection',url:'https://guides.loc.gov/mangyan-bamboo-collection/background',use:'Historical context, distinct communities and bamboo writing.'},
 {id:'mhc',title:'Mangyan Heritage Center · Mangyan Library',url:'https://mangyanheritage.odoo.com/tl/mangyan-library',use:'Community publications, archives and further reading.'},
];
const consonants:Record<string,string>=Object.fromEntries(characters.slice(3).map(c=>[c.name.slice(0,-1),c.glyph]));
const vowels:Record<string,string>={a:'ᜠ',i:'ᜡ',e:'ᜡ',u:'ᜢ',o:'ᜢ'};
export type Conversion={text:string;unsupported:string[]};
// Mechanical modern orthographic rendering of supplied Latin spelling.
// It does not translate Filipino into the Hanunó’o language or infer pronunciation.
export function toHanunoo(input:string):Conversion {
 const s=input.normalize('NFC').toLowerCase();const unsupported=[...new Set([...s].filter(c=>!/[aieguktnp bmyrlwsohd\s0-9.,!?;:()\-]/u.test(c)))];
 if(unsupported.length)return {text:'',unsupported};
 let text='';
 for(let i=0;i<s.length;i++){
  const c=s[i];if(vowels[c]){text+=vowels[c];continue;}
  const token=s.slice(i,i+2)==='ng'?'ng':c;const base=consonants[token];
  if(!base){text+=c;continue;}
  if(token==='ng')i++;
  const next=s[i+1];
  if(next&&vowels[next]){text+=base+(['i','e'].includes(next)?'ᜲ':['o','u'].includes(next)?'ᜳ':'');i++;}
  else text+=base+'᜴';
 }
 return {text,unsupported:[]};
}
export const tracingCharacters=[...characters,...characters.slice(3).flatMap(c=>[
 {id:c.id+'-i',name:c.name.slice(0,-1)+'i / '+c.name.slice(0,-1)+'e',glyph:c.glyph+'ᜲ'},
 {id:c.id+'-u',name:c.name.slice(0,-1)+'u / '+c.name.slice(0,-1)+'o',glyph:c.glyph+'ᜳ'},
 {id:c.id+'-ending',name:c.name.slice(0,-1)+' · with pamudpod',glyph:c.glyph+'᜴'},
])];
