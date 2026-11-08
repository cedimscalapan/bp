import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { Drawing } from './learning';

const W=1080,H=1920;
function round(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
export async function traceStoryPng(d:Drawing):Promise<string>{
 await document.fonts.load('120px Hanunoo');await document.fonts.load('60px Fredoka');
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d');if(!c)throw Error('Image creation is unavailable.');
 const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#123f50');bg.addColorStop(.55,'#226f67');bg.addColorStop(1,'#d7a65e');c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.globalAlpha=.15;c.strokeStyle='#fff9dd';c.lineWidth=4;for(let i=-5;i<12;i++){c.beginPath();c.arc(900,330,100+i*80,0,Math.PI*2);c.stroke();}c.globalAlpha=1;
 c.fillStyle='#ffe9a8';for(const [x,y,r] of [[100,270,13],[960,170,11],[90,1430,8],[995,1540,17],[190,1740,9],[905,1100,7]]){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 c.save();c.shadowColor='#092b33';c.shadowBlur=70;c.shadowOffsetY=30;c.fillStyle='#fffaf0';round(c,76,280,928,1320,48);c.fill();c.restore();
 c.fillStyle='#dcae57';round(c,116,320,848,13,7);c.fill();
 c.fillStyle='#285c5c';c.font='bold 42px Fredoka, sans-serif';c.fillText('KAPAMANA  /  TRACE & LEARN',144,415);
 c.fillStyle='#819087';c.font='32px Fredoka, sans-serif';c.fillText(d.kind==='word'?'WORD PRACTICE':'CHARACTER PRACTICE',144,470);
 c.fillStyle='#dce9db';round(c,140,550,800,800,36);c.fill();
 c.fillStyle='#a9c3b0';c.font='210px Hanunoo, sans-serif';c.textAlign='center';c.fillText(d.target,540,760,740);
 c.strokeStyle='#d4dfd2';c.setLineDash([8,16]);c.lineWidth=4;c.beginPath();c.moveTo(170,975);c.lineTo(910,975);c.moveTo(540,800);c.lineTo(540,1280);c.stroke();c.setLineDash([]);
 c.save();c.translate(140,550);c.scale(800/600,800/(d.canvasHeight??280));c.strokeStyle='#176f65';c.fillStyle='#176f65';c.lineCap='round';c.lineJoin='round';c.lineWidth=10;for(const stroke of d.strokes){if(stroke.length===1){c.beginPath();c.arc(stroke[0].x,stroke[0].y,5,0,Math.PI*2);c.fill();}else if(stroke.length){c.beginPath();c.moveTo(stroke[0].x,stroke[0].y);for(const p of stroke.slice(1))c.lineTo(p.x,p.y);c.stroke();}}c.restore();
 c.textAlign='left';c.fillStyle='#285c5c';c.font='bold 52px Fredoka, sans-serif';c.fillText('My Hanunó’o practice',144,1445);
 c.fillStyle='#74877b';c.font='30px Fredoka, sans-serif';c.fillText(new Date(d.savedAt).toLocaleDateString(),144,1500);
 c.fillStyle='#fff8e6';c.font='bold 72px Fredoka, sans-serif';c.fillText('KA PAMANA',84,1710);
 c.font='32px Fredoka, sans-serif';c.fillText('A little shape, a lasting story.',84,1765);
 return canvas.toDataURL('image/png');
}
function filename(d:Drawing){return `kapamana-trace-${d.savedAt.slice(0,10)}-${d.id.replace(/[^a-z0-9-]/gi,'').slice(0,12)}.png`;}
export async function saveTraceStory(d:Drawing){const data=await traceStoryPng(d);const name=filename(d);if(Capacitor.isNativePlatform()){await Filesystem.writeFile({path:`KaPamana/${name}`,data:data.split(',')[1],directory:Directory.Documents,recursive:true});return name;}const a=document.createElement('a');a.href=data;a.download=name;a.click();return name;}
export async function shareTraceStory(d:Drawing){const data=await traceStoryPng(d);const name=filename(d);if(Capacitor.isNativePlatform()){const {uri}=await Filesystem.writeFile({path:name,data:data.split(',')[1],directory:Directory.Cache});await Share.share({title:'My KaPamana tracing',text:'My Hanunó’o tracing practice',files:[uri],dialogTitle:'Share your tracing'});return;}const file=new File([await (await fetch(data)).blob()],name,{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'My KaPamana tracing'});return;}const a=document.createElement('a');a.href=data;a.download=name;a.click();}
