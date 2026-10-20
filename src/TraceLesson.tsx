import { useRef, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import type { Point } from './learning';
import { guideSize } from './learningActivities';

export type TraceStep={glyph:string;label:string};
export type TraceLessonData={title:string;steps:TraceStep[];kind:'character'|'word'};
export function Ink({strokes}:{strokes:Point[][]}){return <>{strokes.map((s,i)=>s.length===1?<circle key={i} cx={s[0].x} cy={s[0].y} r="5" fill="#176f65"/>:<polyline key={i} points={s.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#176f65" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>)}</>;}

function Board({step,onSave}:{step:TraceStep;onSave:(strokes:Point[][],advance:boolean)=>void}){
 const [strokes,setStrokes]=useState<Point[][]>([]);const [guide,setGuide]=useState(true);const [saved,setSaved]=useState(false);const ink=useRef<Point[][]>([]);const pointer=useRef<number|null>(null);
 function change(next:Point[][]){ink.current=next;setStrokes(next);setSaved(false);}
 function point(e:React.PointerEvent<SVGSVGElement>){const p=e.currentTarget.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const matrix=e.currentTarget.getScreenCTM();const q=matrix?p.matrixTransform(matrix.inverse()):p;return {x:Math.max(0,Math.min(600,q.x)),y:Math.max(0,Math.min(600,q.y))};}
 function stop(e:React.PointerEvent<SVGSVGElement>){if(pointer.current===e.pointerId){pointer.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
 const hasInk=strokes.length>0;
 return <><div className="trace-instructions"><span>Follow the shape with your finger.</span><button aria-pressed={guide} onClick={()=>setGuide(!guide)}>{guide?'Hide guide':'Show guide'}</button></div><div className="large-trace-board"><svg viewBox="0 0 600 600" role="img" aria-label={`Trace ${step.label}`} onPointerDown={e=>{if(pointer.current!==null||ink.current.length>=80||ink.current.flat().length>=1500)return;e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);change([...ink.current,[point(e)]]);}} onPointerMove={e=>{if(pointer.current!==e.pointerId||ink.current.flat().length>=1500)return;const next=[...ink.current];next[next.length-1]=[...next[next.length-1],point(e)];change(next);}} onPointerUp={stop} onPointerCancel={stop}>
 <path d="M50 300H550M300 50V550" stroke="#e0e5d9" strokeDasharray="5 12"/>
 {guide&&<text x="300" y="315" textAnchor="middle" dominantBaseline="middle" className="hanunoo-glyph" fontSize={guideSize(step.glyph)} fill="#c4cdbb">{step.glyph}</text>}<Ink strokes={strokes}/></svg></div><div className="trace-tools"><button disabled={!hasInk} onClick={()=>change(strokes.slice(0,-1))}>↶ Undo</button><button disabled={!hasInk} onClick={()=>change([])}>Clear</button><button disabled={!hasInk||saved} onClick={()=>{onSave(strokes,false);setSaved(true);}}>{saved?'✓ Saved':'Save'}</button></div><div className="trace-bottom"><IonButton expand="block" disabled={!hasInk} onClick={()=>onSave(strokes,true)}>Save &amp; next →</IonButton><small role="status">{saved?'Saved on this device.':'Practice at your own pace. No stroke-order grading.'}</small></div></>;
}

export default function TraceLesson({lesson,onClose,onSave}:{lesson:TraceLessonData;onClose:()=>void;onSave:(step:TraceStep,strokes:Point[][])=>void}){
 const [index,setIndex]=useState(0);const step=lesson.steps[index];
 return <IonModal isOpen onDidDismiss={onClose} className="trace-fullscreen"><IonHeader className="ion-no-border"><IonToolbar><IonButton slot="start" fill="clear" onClick={onClose}>← Done</IonButton><IonTitle>Trace &amp; learn</IonTitle><span className="trace-counter" slot="end">{index+1}/{lesson.steps.length}</span></IonToolbar></IonHeader><IonContent scrollY={false}><div className="trace-workspace"><div className="trace-lesson-heading"><small>{lesson.title}</small><h2>{step.label}</h2><progress aria-label="Lesson progress" value={index+1} max={lesson.steps.length}/></div><Board key={index} step={step} onSave={(strokes,advance)=>{onSave(step,strokes);if(advance){if(index+1<lesson.steps.length)setIndex(index+1);else onClose();}}}/></div></IonContent></IonModal>;
}
