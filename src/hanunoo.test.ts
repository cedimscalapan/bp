import {describe,it,expect} from 'vitest';
import {hanunooSources,toHanunoo,tracingCharacters} from './hanunoo';
describe('Modern Hanunó’o script rendering',()=>{
 it('uses inherent a and shared i/e and u/o marks',()=>{expect(toHanunoo('ka').text).toBe('ᜣ');expect(toHanunoo('ki ke').text).toBe('ᜣᜲ ᜣᜲ');expect(toHanunoo('ku ko').text).toBe('ᜣᜳ ᜣᜳ');});
 it('handles independent and consecutive vowels and ng as one consonant',()=>{expect(toHanunoo('a i e u o').text).toBe('ᜠ ᜡ ᜡ ᜢ ᜢ');expect(toHanunoo('tao').text).toBe('ᜦᜢ');expect(toHanunoo('nga ng').text).toBe('ᜥ ᜥ᜴');});
 it('retains final and clustered consonants with pamudpod',()=>{expect(toHanunoo('danum').text).toBe('ᜧᜨᜳᜫ᜴');expect(toHanunoo('magdaka').text).toBe('ᜫᜤ᜴ᜧᜣ');});
 it('keeps separators and stops rather than guessing unsupported spellings',()=>{expect(toHanunoo('KA, 2!').text).toBe('ᜣ, 2!');expect(toHanunoo('f café').text).toBe('');expect(toHanunoo('f café').unsupported).toEqual(['f','c','é']);});
 it('credits all four requested references and includes vowel and ending tracing',()=>{expect(hanunooSources).toHaveLength(4);expect(tracingCharacters.find(c=>c.id==='letter-ka-i')?.glyph).toBe('ᜣᜲ');expect(tracingCharacters.find(c=>c.id==='letter-ka-ending')?.glyph).toBe('ᜣ᜴');});
});
