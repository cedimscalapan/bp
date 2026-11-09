import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

type StoryShare = { title: string; text: string; dialogTitle: string };

function download(data: string, name: string) {
 const anchor = document.createElement('a');
 anchor.href = data;
 anchor.download = name;
 anchor.click();
}

export async function saveStoryPng(data: string, name: string, folder: string) {
 if (Capacitor.isNativePlatform()) {
  await Filesystem.writeFile({ path: `KaPamana/${folder ? `${folder}/` : ''}${name}`, data: data.split(',')[1], directory: Directory.Documents, recursive: true });
 } else {
  download(data, name);
 }
 return name;
}

export async function shareStoryPng(data: string, name: string, options: StoryShare): Promise<'shared' | 'downloaded'> {
 if (Capacitor.isNativePlatform()) {
  const { uri } = await Filesystem.writeFile({ path: name, data: data.split(',')[1], directory: Directory.Cache });
  await Share.share({ title: options.title, text: options.text, files: [uri], dialogTitle: options.dialogTitle });
  return 'shared';
 }
 const file = new File([await (await fetch(data)).blob()], name, { type: 'image/png' });
 if (navigator.share && navigator.canShare?.({ files: [file] })) {
  await navigator.share({ files: [file], title: options.title, text: options.text });
  return 'shared';
 }
 download(data, name);
 return 'downloaded';
}
