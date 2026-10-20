import {describe,it,expect} from 'vitest';
import {scriptUnits,tagalogWords,guideSize} from './learningActivities';
import {freshLearning,validLearning} from './learning';
import {toHanunoo} from './hanunoo';
import {freshSave,parseSave} from './model';
describe('Guided character tracing',()=>{
 it('keeps vowel signs and pamudpod attached to exactly one base character',()=>{expect(scriptUnits('ᜦᜳᜪᜲᜤ᜴')).toEqual(['ᜦᜳ','ᜪᜲ','ᜤ᜴']);expect(scriptUnits('ᜣ ᜥ᜴')).toEqual(['ᜣ','ᜥ᜴']);});
 it('offers at least 70 unique Tagalog exercises without unsupported substitutions',()=>{expect(tagalogWords.length).toBeGreaterThanOrEqual(70);expect(new Set(tagalogWords.map(w=>w.id)).size).toBe(tagalogWords.length);for(const w of tagalogWords){expect(toHanunoo(w.word).unsupported).toEqual([]);expect(w.script).toBeTruthy();expect(scriptUnits(w.script).length).toBeGreaterThan(0);}});
 it('fits single characters larger than multi-character word guides',()=>{expect(guideSize('ᜣ')).toBe(360);expect(guideSize('ᜣᜲ')).toBe(360);expect(guideSize('ᜦᜳᜪᜲᜤ᜴')).toBeLessThan(guideSize('ᜣ'));});
 it('restores new square drawings and legacy wide drawings at their own coordinates',()=>{const legacy={id:'old',target:'ᜣ',kind:'character' as const,savedAt:'2026-10-20',strokes:[[{x:20,y:270}]]};const square={...legacy,id:'new',canvasHeight:600 as const,strokes:[[{x:580,y:590}]]};const learning={...freshLearning(),drawings:[legacy,square]};expect(validLearning(learning)).toBe(true);const loaded=parseSave(JSON.stringify({...freshSave(),learning}));expect(loaded.learning.drawings[0].canvasHeight).toBeUndefined();expect(loaded.learning.drawings[1].strokes[0][0].y).toBe(590);expect(validLearning({...learning,drawings:[{...square,strokes:[[{x:4,y:601}]]}]})).toBe(false);});
});
