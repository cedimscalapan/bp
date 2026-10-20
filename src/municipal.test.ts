import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import data from './data/municipal_assets.json';
import catalog from './data/catalog.json';
import heritage from './data/heritage.json';
describe('Separate municipal artwork',()=>{
 it('gives every local destination three distinct assets, without sharing or recoloring one file',()=>{
  expect(data).toHaveLength(15);
  expect(new Set(data.map(a=>a.destinationID)).size).toBe(15);
  const paths=data.flatMap(a=>[a.tokenImage,a.passportImage,a.spriteImage]);
  expect(new Set(paths).size).toBe(45);
  const hashes=paths.map(path=>createHash('sha256').update(readFileSync(new URL('../public/assets/'+path,import.meta.url))).digest('hex'));
  expect(new Set(hashes).size).toBe(45);
  for(const a of data){
   const d=catalog.find(d=>d.destinationID===a.destinationID)!;
   const p=heritage.profiles.find(p=>p.destinationID===a.destinationID)!;
   expect(d.signatureImage).toBe(a.tokenImage);
   expect(d.signatureItemName).toBe(a.tokenName);
   expect(p.pickupImage).toBe(a.tokenImage);
   expect(d.levels.map(l=>l.id)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12].map(n=>a.destinationID+'_level_'+n));
  }
 });
});
