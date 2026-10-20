import data from './data/municipal_assets.json';
export const municipalAssets=data;
export const municipalFor=(id:string)=>municipalAssets.find(a=>a.destinationID===id);
export function MunicipalSprite({id}:{id:string}){
 const a=municipalFor(id);if(!a)return null;
 return <section className="municipal-identity"><img src={'/assets/'+a.spriteImage} alt={a.name+' fictional story sprite'} loading="lazy" decoding="async"/><div><small>YOUR LOCAL STORY GUIDE</small><h3>{a.spriteName}</h3><p>A playful, fictional companion for your {a.name} adventure.</p></div></section>;
}
