import { useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { bookOutline, downloadOutline, flagOutline, gridOutline, lockClosed, settingsOutline, shareSocialOutline } from 'ionicons/icons';
import { buddies, destinationStamped, type Save, type Destination } from './model';
import { municipalFor } from './municipal';
import { savePassportStory, sharePassportStory } from './passportStory';

type Props = { save: Save; destinations: Destination[]; onDestination: (d: Destination) => void; onClose: () => void; onSettings: () => void };

export default function Passport({ save, destinations, onDestination, onClose, onSettings }: Props) {
 const [filter, setFilter] = useState('all');
 const [view, setView] = useState('book');
 const [spread, setSpread] = useState(0);
 const [exporting, setExporting] = useState<string | null>(null);
 const [exportStatus, setExportStatus] = useState('');
 const touch = useRef<{ x: number; y: number } | null>(null);
 const places = destinations.filter(d => filter === 'all' || (filter === 'mindoro' ? d.group === 'Oriental Mindoro' : filter === 'festivals' ? d.group === 'Oriental Mindoro Festivals' : !!save.completed[d.levels.at(-1)!.id]));
 const pages: [null, ...Destination[]] = [null, ...places];
 const spreads = Math.ceil(pages.length / 2);
 const current = Math.min(spread, spreads - 1);
 const buddy = buddies.find(b => b.id === save.buddy)!;
 const stamped = (d: Destination) => destinationStamped(d, save);
 const count = destinations.filter(stamped).length;

 function turn(delta: number) { setSpread(Math.max(0, Math.min(spreads - 1, current + delta))); }
 function changeFilter(next: string) { setFilter(next); setSpread(0); }

 async function exportPage(destination: Destination | null, share: boolean) {
  const key = destination?.destinationID ?? 'traveler';
  setExporting(key);
  setExportStatus('Preparing your passport image…');
  try {
   if (share) {
    const result = await sharePassportStory(save, destinations, destination);
    setExportStatus(result === 'shared' ? 'Passport opened in your share options.' : 'Sharing is unavailable here. The passport image was downloaded instead.');
   } else {
    await savePassportStory(save, destinations, destination);
    setExportStatus('Passport image saved.');
   }
  } catch (error) {
   setExportStatus((error as Error).name === 'AbortError' ? 'Sharing canceled.' : (error as Error).message || 'Could not export the passport image.');
  } finally {
   setExporting(null);
  }
 }

 function pageActions(destination: Destination | null) {
  const key = destination?.destinationID ?? 'traveler';
  const label = destination?.name ?? 'traveler passport';
  return <div className="passport-leaf-actions">
   <button type="button" disabled={exporting !== null} aria-label={`Save ${label} as an image`} onClick={() => void exportPage(destination, false)}><IonIcon icon={downloadOutline}/>Save image</button>
   <button type="button" disabled={exporting !== null} aria-label={`Share ${label}`} onClick={() => void exportPage(destination, true)}><IonIcon icon={shareSocialOutline}/>Share</button>
   {exporting === key && <span className="passport-exporting">Preparing…</span>}
  </div>;
 }

 function destinationPage(d: Destination, index: number) {
  const earned = stamped(d);
  const progress = d.levels.filter(l => save.completed[l.id]).length;
  return <article className={`passport-leaf destination-leaf ${earned ? 'is-stamped' : ''}`} key={d.destinationID}>
   <button type="button" className="passport-leaf-open" onClick={() => onDestination(d)} aria-label={`${d.name}, ${earned ? 'stamp earned' : `${progress} of ${d.levels.length} missions`}. Open destination`}>
    <small>{d.group}</small><h2>{d.name}</h2>
    <span className="stamp-circle">{earned ? <img src={`/assets/${d.passportImage ?? municipalFor(d.destinationID)?.passportImage ?? d.signatureImage}`} alt={`${d.name} stamp`}/> : <IonIcon icon={lockClosed}/>}</span>
    <span className="stamp-status">{earned ? (progress < d.levels.length ? `Stamp kept · ${progress}/${d.levels.length} missions` : 'Memory collected') : `${progress} / ${d.levels.length} missions · Explore →`}</span>
   </button>
   {pageActions(d)}<span className="leaf-number">– {index + 1} –</span>
  </article>;
 }

 return <section className="passport-experience">
  <div className="collection-heading"><div><h1>KaPamana Passport</h1><p>{view === 'book' ? 'Swipe to turn the pages' : 'Your journeys, one memory at a time'}</p></div><button className="round-settings" aria-label="Passport settings" onClick={onSettings}><IonIcon icon={settingsOutline}/></button></div>
  <p className="passport-export-hint">Save or share any passport page as a complete portrait image.</p>
  {exportStatus && <p className="passport-export-status" role="status">{exportStatus}</p>}
  <div className="passport-filters" role="group" aria-label="Filter passport destinations">{[['all', 'All', bookOutline], ['mindoro', 'Mindoro', flagOutline], ['festivals', 'Festivals', flagOutline], ['earned', 'Earned', flagOutline]].map(([id, label, icon]) => <button key={id} aria-pressed={filter === id} onClick={() => changeFilter(id)}><IonIcon icon={icon}/>{label}</button>)}</div>
  <div className="passport-views" role="group" aria-label="Passport view"><button aria-pressed={view === 'book'} onClick={() => setView('book')}><IonIcon icon={bookOutline}/>Passport</button><button aria-pressed={view === 'cards'} onClick={() => setView('cards')}><IonIcon icon={gridOutline}/>Cards</button></div>
  {view === 'book' ? <><div className="passport-book" aria-label="Passport pages" onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }} onTouchEnd={e => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x; const dy = e.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1); touch.current = null; }} onTouchCancel={() => { touch.current = null; }}>
   {pages.slice(current * 2, current * 2 + 2).map((d, i) => d ? destinationPage(d, current * 2 + i) : <article className="passport-leaf identity-leaf" key="identity"><small>TRAVELER IDENTITY</small><img className="passport-portrait" src={`/assets/buddy_${save.buddy}_front.webp`} alt={buddy.name}/><h2>{save.name}</h2><p>{buddy.name} · Team lead</p><span className="level-pill">★ Level {1 + Math.floor(save.xp / 500)}</span><dl><div><dt>STAMPS</dt><dd>{count}</dd></div><div><dt>TRAVELER XP</dt><dd>{save.xp}</dd></div><div><dt>MISSIONS</dt><dd>{Object.keys(save.completed).length}</dd></div></dl>{pageActions(null)}<span className="leaf-number">– 1 –</span></article>)}
   {(current * 2 + 1 >= pages.length) && <article className="passport-leaf last-leaf"><IonIcon icon={bookOutline}/><h2>More memories await</h2><p>Your next adventure is only a page away.</p></article>}
  </div><div className="passport-pagination"><button aria-label="Previous passport pages" disabled={current === 0} onClick={() => turn(-1)}>‹</button><span aria-live="polite">{current + 1} / {spreads}</span><button aria-label="Next passport pages" disabled={current === spreads - 1} onClick={() => turn(1)}>›</button></div></> : <div className="passport-card-grid">{places.length ? places.map((d, i) => destinationPage(d, i)) : <div className="collection-empty"><h2>Your first stamp is waiting.</h2><p>Complete the runner campaign at a destination to collect its stamp.</p><button className="yellow-link" onClick={() => changeFilter('mindoro')}>Explore Mindoro stamps</button></div>}</div>}
  <button className="close-passport" onClick={onClose}><IonIcon icon={bookOutline}/>Close Passport</button>
 </section>;
}
