import profiles from './data/cultural-profiles.json';
import {Sources} from './Sources';
export default function CulturalIdentity({placeID}:{placeID:string}){
 const profile=profiles.find(p=>p.placeID===placeID);if(!profile)return null;
 return <section className="cultural-identity"><h3>Living heritage and local skills</h3><h4>{profile.theme}</h4><p>{profile.livingHeritage}</p><h4>Values to practice on your journey</h4><ul>{profile.travelerValues.map(value=><li key={value}>{value}</li>)}</ul><h4>Early communities and origins</h4><p>{profile.origins}</p><p><strong>Who first discovered this place?</strong> {profile.discovererStatus}</p><Sources ids={profile.sourceIDs}/></section>;
}
