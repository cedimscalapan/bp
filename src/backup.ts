import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { Save } from './model';
export async function exportBackup(save:Save){
 const data=JSON.stringify(save,null,2);
 if(Capacitor.isNativePlatform()){
  const {uri}=await Filesystem.writeFile({path:'buddyport-backup.json',data,directory:Directory.Cache,encoding:Encoding.UTF8});
  await Share.share({title:'BuddyPort backup',files:[uri],dialogTitle:'Save your BuddyPort backup'});
 }else{
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='buddyport-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
 }
}
