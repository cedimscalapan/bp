"""Rebuild the provenance library from existing editorial material; never imply live verification."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
h=json.loads((root/'src/data/heritage.json').read_text())
prior=json.loads((root/'docs/research/Oriental-Mindoro-content-pack.json').read_text())
primary={'act3498','socorro_law'}
oral={'legend','oral_account','oral_tradition','local_etymology_account','local_history_account'}
claims=[];dossiers=[];sourceByID={s['id']:s for s in h['sources']}
for p in h['profiles']:
 draft=next(x for x in prior['profiles'] if x['destinationID']==p['destinationID'])
 ids=[]
 for f in p['discoveries']:
  claim={
   'id':f['id'],'placeID':p['destinationID'],'topic':f['category'],'title':f['title'],'playerText':f['text'],
   'ageOrReadingLevel':'Independent readers; adult-assisted early readers','sourceIDs':f['sourceIDs'],
   'evidenceType':'oral_account' if f['evidenceStatus'] in oral else 'primary_record_citation' if any(s in primary for s in f['sourceIDs']) else 'inherited_official_or_institutional_summary',
   'uncertainty':'Not reverified in this task. '+('A remembered account, not a confirmed origin.' if f['evidenceStatus'] in oral else 'Publication dates and exact supporting page/section require live verification.'),
   'learningObjective':'Explain '+f['category']+' in '+p['name']+' using the cited discovery.',
   'questionIdeas':['Identify the supported detail','Explain the relationship to everyday community life'],
   'missionIdeas':['Evidence classification' if f['evidenceStatus'] in oral else 'Source investigation','Applied community scenario'],
   'artworkRequirements':{'sprite':'Use the municipality’s fictional story guide','token':'Use its unique symbolic token, not a real cultural object','stamp':'Preserve the existing five-mission stamp'},
   'supportingReferences':[{'sourceID':sid,'publisher':sourceByID[sid]['publisher'],'title':sourceByID[sid]['title'],'url':sourceByID[sid]['url'],'publicationDate':None,'pageOrSection':None,'accessDate':None,'passageVerification':'not_completed'} for sid in f['sourceIDs']],
   'crossCheckStatus':'not_completed','editorialWarnings':draft.get('verificationGaps',[]),
   'researchStatus':'inherited_not_reverified','editorialReview':'pending','newHistoricalClaim':False}
  claims.append(claim);ids.append(claim['id'])
 topicMap={
  'name_and_identity':{'claimIDs':[f['id'] for f in p['discoveries'] if f['evidenceStatus'] in oral],'gap':'Verify etymology, former names, language attribution, and alternative accounts using source text.'},
  'earliest_settlement':{'claimIDs':[],'gap':'Earliest documented communities, migration, and settlement chronology need primary or scholarly research. Do not substitute outsider arrival for discovery.'},
  'administrative_development':{'claimIDs':[p['discoveries'][0]['id'],p['discoveries'][1]['id']],'gap':'A history fact is not necessarily administrative history; verify laws, dates, and jurisdictional changes individually.'},
  'major_historical_developments':{'claimIDs':[p['discoveries'][0]['id']],'gap':'No complete local chronology yet. Significant events and competing dates require verification.'},
  'livelihoods':{'claimIDs':[p['discoveries'][2]['id']],'gap':'Document changes over time and seasonal details before creating historical production claims.'},
  'culture_and_knowledge':{'claimIDs':[p['discoveries'][3]['id']],'gap':'Community attribution and cultural permissions remain pending. Do not reproduce restricted knowledge.'},
  'geography_environment_civics':{'claimIDs':[p['discoveries'][1]['id'],p['discoveries'][4]['id']],'gap':'Barangay figures retain their original reference date; no current statistics or hazard assurances are inferred.'}}
 dossiers.append({'placeID':p['destinationID'],'name':p['name'],'claimIDs':ids,'topics':topicMap,'priorEditorialGaps':draft.get('verificationGaps',[]),'researchStatus':'live_verification_blocked_by_network_policy'})
sources=[]
for s in h['sources']:
 sources.append({**s,'publicationDate':None,'supportingPageOrSection':None,'accessDate':None,'previousResearchDate':prior['researchedOn'],'verificationStatus':'not_reverified','notes':'Citation inherited from repository. Do not treat this URL alone as supporting a new claim.'})
candidates=json.loads((root/'src/data/research-notes.json').read_text())
report={'candidateClaims':candidates,'version':1,'preparedOn':'2026-10-21','scope':'15 Oriental Mindoro places; no festival or sightseeing missions','liveResearchStatus':'blocked: proxy denied government and legal-source HTTPS requests (403 Forbidden)','sources':sources,'claims':claims,'dossiers':dossiers}
(root/'src/data/community-library.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
folder=root/'docs/research/dossiers';folder.mkdir(exist_ok=True)
for p in dossiers:
 text='# '+p['name']+' — research dossier\n\nStatus: inherited editorial material; live source verification is blocked. No new historical claims are asserted.\n\n'
 for key,coverage in p['topics'].items():
  text+='## '+key.replace('_',' ').title()+'\n\n'
  for id in coverage['claimIDs']:
   c=next(c for c in claims if c['id']==id);text+='- '+c['playerText']+'\n  - Evidence: '+c['evidenceType']+'; source IDs: '+', '.join(c['sourceIDs'])+'.\n'
  text+='\nResearch gap: '+coverage['gap']+'\n\n'
 note=next(n for n in candidates if n['placeID']==p['placeID'])
 text+='## Unverified research lead integrated in the app\n\n'+note['statement']+'\n\nStatus: '+note['evidenceLabel']+'. This is not a factual quiz answer.\n\nVerification needed: '+note['verificationNeeded']+'\n\n'
 text+='## Earlier editorial warnings\n\n'+'\n'.join('- '+g for g in p['priorEditorialGaps'])+'\n'
 (folder/(p['placeID'].replace('oriental_mindoro_','')+'.md')).write_text(text)
(root/'docs/research/COVERAGE.md').write_text('# Community research coverage\n\nPrepared 21 October 2026 (Asia/Manila). Research access is blocked, not completed. Existing claims are available for better gameplay; additional established name, settlement, and historical-event claims require source verification. Fifteen attributed candidate notes are integrated separately, never as confirmed factual answers.\n\n| Place | Existing claim records | Topic dossiers | Live verification |\n|---|---:|---:|---|\n'+''.join('| '+p['name']+' | '+str(len(p['claimIDs']))+' | 7 | Blocked |\n' for p in dossiers)+'\nThe machine-readable source and claim register is `src/data/community-library.json`. Each of the 69 source records explicitly distinguishes previous research from current access and leaves unknown publication dates and page references null.\n')
print(f'Built {len(claims)} claims, {len(sources)} source records and {len(dossiers)} seven-topic dossiers.')
