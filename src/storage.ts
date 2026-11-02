import { Preferences } from '@capacitor/preferences';
import { parseSave, type Save } from './model';
const key='buddyport.ionic.v1';
type SaveListener=(save:Save)=>void;
const listeners=new Set<SaveListener>();
/** Observe every stored save (used by the optional cloud backup). Returns an unsubscribe function. */
export function onSaveStored(listener:SaveListener){listeners.add(listener);return()=>{listeners.delete(listener);};}
export async function loadSave(){return parseSave((await Preferences.get({key})).value);}
let pending=Promise.resolve();
export function storeSave(save:Save){const next=pending.catch(()=>{}).then(()=>Preferences.set({key,value:JSON.stringify(save)})).then(()=>{for(const l of listeners){try{l(save);}catch(e){console.warn('Save listener failed.',e);}}});pending=next;return next;}
