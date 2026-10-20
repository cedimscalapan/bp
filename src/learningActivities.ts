import { toHanunoo } from './hanunoo';

// Authored Tagalog spelling exercises, not Hanunó’o vocabulary translations.
export const tagalogGroups={
 'Pamilya':['ama','ina','anak','ate','kuya','lolo','lola','apo','asawa','kapatid'],
 'Kalikasan':['araw','buwan','bituin','langit','ulap','ulan','hangin','dagat','ilog','bundok','puno','dahon','bulaklak','lupa','bato'],
 'Bahay':['bahay','pinto','ilaw','mesa','upuan','kama','unan','kumot','plato','baso'],
 'Pagkain':['tubig','kanin','bigas','isda','itlog','gatas','saging','mangga','gulay','niyog'],
 'Araw-araw':['basa','sulat','aral','laro','lakad','takbo','kain','inom','tulog','gising'],
 'Pagpapahalaga':['bayan','kapwa','gabay','galang','tulong','ingat','sipag','tiyaga','talino','ligaya','pag-asa','pag-ibig','salamat','mabuti','malaya'],
};
export const tagalogWords=Object.entries(tagalogGroups).flatMap(([category,list])=>list.map(word=>({id:'tagalog:'+word,word,category,script:toHanunoo(word).text})));
export function scriptUnits(text:string):string[]{
 const units:string[]=[];
 for(const c of text){if(/[\u1732-\u1734]/u.test(c)&&units.length)units[units.length-1]+=c;else if(/[\u1720-\u1731]/u.test(c))units.push(c);}
 return units;
}
export function guideSize(target:string){return Math.min(360,490/Math.max(1,scriptUnits(target).length)*1.25);}
