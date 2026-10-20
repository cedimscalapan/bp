import { Preferences } from '@capacitor/preferences';
import { parseSave, type Save } from './model';
const key='buddyport.ionic.v1';
export async function loadSave(){return parseSave((await Preferences.get({key})).value);}
let pending=Promise.resolve();
export function storeSave(save:Save){const next=pending.catch(()=>{}).then(()=>Preferences.set({key,value:JSON.stringify(save)}));pending=next;return next;}
