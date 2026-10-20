import notes from './data/research-notes.json';
import {Sources} from './Sources';
export const researchNotesFor=(placeID:string)=>notes.filter(note=>note.placeID===placeID);
export default function ResearchNotes({placeID}:{placeID:string}){
 const entries=researchNotesFor(placeID);if(!entries.length)return null;
 return <section className="research-notes"><h3>Research in progress</h3><p>These are attributed research leads and unresolved questions, not confirmed historical facts. They are not answers to factual quizzes.</p>{entries.map(note=><details key={note.id}><summary>{note.title}</summary><small>{note.evidenceLabel}</small><p>{note.statement}</p><h4>What needs checking?</h4><p>{note.verificationNeeded}</p><Sources ids={note.sourceIDs}/></details>)}</section>;
}
