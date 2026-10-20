let music:HTMLAudioElement|undefined;
export function playMusic(track:string,enabled:boolean){if(!enabled){music?.pause();return;}const src=`/assets/${track}.ogg`;if(!music||!music.src.endsWith(src)){music?.pause();music=new Audio(src);music.loop=true;music.volume=.25;}void music.play().catch(()=>{});}
export function sound(name:string,enabled:boolean){if(enabled){const a=new Audio(`/assets/${name}.wav`);a.volume=.45;void a.play().catch(()=>{});}}
