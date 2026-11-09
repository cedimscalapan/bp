import { buddies, destinationStamped, type Destination, type Save } from './model';
import { municipalFor } from './municipal';
import { saveStoryPng, shareStoryPng } from './storyExport';

const WIDTH = 1080;
const HEIGHT = 1920;

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
 ctx.beginPath();
 ctx.roundRect(x, y, width, height, radius);
}

function fitText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number, start: number, min: number) {
 let size = start;
 do {
  ctx.font = `bold ${size}px Fredoka, sans-serif`;
  if (ctx.measureText(value).width <= maxWidth) return size;
  size -= 2;
 } while (size >= min);
 return min;
}

async function artwork(path: string): Promise<HTMLImageElement | null> {
 const image = new Image();
 image.src = `/assets/${path}`;
 try {
  await image.decode();
  return image;
 } catch {
  return null;
 }
}

function contain(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
 const ratio = Math.min(width / image.naturalWidth, height / image.naturalHeight);
 const drawWidth = image.naturalWidth * ratio;
 const drawHeight = image.naturalHeight * ratio;
 ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function cover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
 const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
 const drawWidth = image.naturalWidth * ratio;
 const drawHeight = image.naturalHeight * ratio;
 ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function stat(ctx: CanvasRenderingContext2D, x: number, value: string, label: string) {
 ctx.fillStyle = '#205f62';
 ctx.font = 'bold 55px Fredoka, sans-serif';
 ctx.fillText(value, x, 1235);
 ctx.fillStyle = '#70857d';
 ctx.font = '27px Fredoka, sans-serif';
 ctx.fillText(label, x, 1282);
}

export async function passportStoryPng(save: Save, destinations: Destination[], destination: Destination | null): Promise<string> {
 await document.fonts.load('72px Fredoka');
 const canvas = document.createElement('canvas');
 canvas.width = WIDTH;
 canvas.height = HEIGHT;
 const ctx = canvas.getContext('2d');
 if (!ctx) throw new Error('Passport image creation is unavailable.');

 const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
 background.addColorStop(0, '#103d50');
 background.addColorStop(.63, '#1e6b65');
 background.addColorStop(1, '#d4a45f');
 ctx.fillStyle = background;
 ctx.fillRect(0, 0, WIDTH, HEIGHT);
 ctx.globalAlpha = .13;
 ctx.strokeStyle = '#fff8dc';
 ctx.lineWidth = 4;
 for (let ring = 0; ring < 11; ring++) {
  ctx.beginPath();
  ctx.arc(925, 270, 110 + ring * 76, 0, Math.PI * 2);
  ctx.stroke();
 }
 ctx.globalAlpha = 1;

 const logo = await artwork('kapamana-icon-512.png');
 if (logo) contain(ctx, logo, 82, 68, 102, 102);
 ctx.fillStyle = '#fff9eb';
 ctx.font = 'bold 47px Fredoka, sans-serif';
 ctx.fillText('KA-PAMANA', 206, 118);
 ctx.fillStyle = '#f4d88f';
 ctx.font = '28px Fredoka, sans-serif';
 ctx.fillText('TRAVEL PASSPORT', 209, 161);

 ctx.save();
 ctx.shadowColor = '#092e38';
 ctx.shadowBlur = 62;
 ctx.shadowOffsetY = 26;
 ctx.fillStyle = '#fffaf0';
 rounded(ctx, 72, 242, 936, 1334, 48);
 ctx.fill();
 ctx.restore();
 ctx.fillStyle = '#d9ab56';
 rounded(ctx, 112, 281, 856, 13, 7);
 ctx.fill();

 const buddy = buddies.find(item => item.id === save.buddy);
 if (destination) {
  const earned = destinationStamped(destination, save);
  const completed = destination.levels.filter(level => (save.completed[level.id] ?? 0) > 0).length;
  const hero = await artwork(destination.image);
  ctx.save();
  rounded(ctx, 112, 326, 856, 480, 30);
  ctx.clip();
  if (hero) cover(ctx, hero, 112, 326, 856, 480);
  else { ctx.fillStyle = '#dce9db'; ctx.fillRect(112, 326, 856, 480); }
  const shade = ctx.createLinearGradient(0, 550, 0, 806);
  shade.addColorStop(0, '#0c3a45aa');
  shade.addColorStop(1, '#0c3a45ee');
  ctx.fillStyle = shade;
  ctx.fillRect(112, 538, 856, 268);
  ctx.restore();
  ctx.fillStyle = '#ffdfa0';
  ctx.font = 'bold 28px Fredoka, sans-serif';
  ctx.fillText(destination.group.toUpperCase(), 150, 614, 778);
  fitText(ctx, destination.name, 780, 65, 39);
  ctx.fillStyle = '#fffaf0';
  ctx.fillText(destination.name, 150, 704, 780);

  const stampPath = destination.passportImage ?? municipalFor(destination.destinationID)?.passportImage ?? destination.signatureImage;
  const stamp = earned ? await artwork(stampPath) : null;
  ctx.fillStyle = '#f2ead4';
  ctx.beginPath();
  ctx.arc(540, 1025, 181, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = earned ? '#d6a752' : '#b9c8bc';
  ctx.stroke();
  if (stamp) contain(ctx, stamp, 384, 869, 312, 312);
  else {
   ctx.textAlign = 'center';
   ctx.fillStyle = '#7c968a';
   ctx.font = 'bold 43px Fredoka, sans-serif';
   ctx.fillText(earned ? 'STAMP' : 'STAMP AWAITS', 540, 1041, 300);
   ctx.textAlign = 'left';
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#245d64';
  ctx.font = 'bold 49px Fredoka, sans-serif';
  ctx.fillText(earned ? 'Memory collected' : 'Your next memory awaits', 540, 1286, 815);
  ctx.fillStyle = '#748a80';
  ctx.font = '31px Fredoka, sans-serif';
  ctx.fillText(`${completed} of ${destination.levels.length} runner missions completed`, 540, 1346);
  ctx.fillStyle = '#dce8d9';
  rounded(ctx, 173, 1385, 734, 24, 12);
  ctx.fill();
  if (completed) {
   ctx.fillStyle = '#d6aa54';
   rounded(ctx, 173, 1385, 734 * completed / destination.levels.length, 24, 12);
   ctx.fill();
  }
  ctx.fillStyle = '#668077';
  ctx.font = '29px Fredoka, sans-serif';
  const traveler = save.name.trim() || 'Traveler';
  ctx.fillText(`Traveler: ${traveler}`, 540, 1479, 780);
  ctx.textAlign = 'left';
 } else {
  const portrait = await artwork(`buddy_${save.buddy}_front.webp`);
  ctx.fillStyle = '#dce9db';
  rounded(ctx, 134, 356, 812, 614, 37);
  ctx.fill();
  if (portrait) contain(ctx, portrait, 309, 410, 460, 510);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#748a80';
  ctx.font = '31px Fredoka, sans-serif';
  ctx.fillText('TRAVELER IDENTITY', 540, 1042);
  fitText(ctx, save.name.trim() || 'Traveler', 800, 66, 38);
  ctx.fillStyle = '#245d64';
  ctx.fillText(save.name.trim() || 'Traveler', 540, 1120, 800);
  ctx.font = '30px Fredoka, sans-serif';
  ctx.fillText(`${buddy?.name ?? 'Buddy'} by your side · Level ${1 + Math.floor(save.xp / 500)}`, 540, 1174, 800);
  const stamps = destinations.filter(item => destinationStamped(item, save)).length;
  stat(ctx, 288, String(stamps), 'STAMPS');
  stat(ctx, 540, String(Object.keys(save.completed).length), 'MISSIONS');
  stat(ctx, 804, save.xp.toLocaleString(), 'XP');
  ctx.fillStyle = '#748a80';
  ctx.font = '30px Fredoka, sans-serif';
  ctx.fillText('Every journey begins with one place.', 540, 1459, 810);
  ctx.textAlign = 'left';
 }

 ctx.fillStyle = '#fff8e6';
 ctx.font = 'bold 75px Fredoka, sans-serif';
 ctx.fillText('KA PAMANA', 82, 1713);
 ctx.font = '31px Fredoka, sans-serif';
 ctx.fillText('A place remembered, a story carried forward.', 84, 1766);
 ctx.fillStyle = '#fff4d6';
 ctx.font = '26px Fredoka, sans-serif';
 ctx.fillText(new Date().toLocaleDateString(), 84, 1823);
 return canvas.toDataURL('image/png');
}

function fileName(destination: Destination | null) {
 const page = (destination?.destinationID ?? 'traveler').replace(/[^a-z0-9-]/gi, '').slice(0, 64);
 return `kapamana-passport-${page}-${new Date().toISOString().slice(0, 10)}.png`;
}

export async function savePassportStory(save: Save, destinations: Destination[], destination: Destination | null) {
 return saveStoryPng(await passportStoryPng(save, destinations, destination), fileName(destination), 'Passports');
}

export async function sharePassportStory(save: Save, destinations: Destination[], destination: Destination | null) {
 return shareStoryPng(await passportStoryPng(save, destinations, destination), fileName(destination), {
  title: destination ? `${destination.name} | KaPamana passport` : 'My KaPamana passport',
  text: destination ? `My ${destination.name} passport memory` : 'My KaPamana travel passport',
  dialogTitle: 'Share your passport',
 });
}
