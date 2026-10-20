import json
from pathlib import Path
root=Path(__file__).resolve().parents[1];h=json.loads((root/'src/data/heritage.json').read_text());profiles=h['profiles'];out=[]
oral={'legend','oral_account','oral_tradition','local_etymology_account','local_history_account'}
# Original teaching simulations: these are not asserted historic production sequences.
chains={
 'Puerto Galera':('Basket-making',['Prepare fictional craft materials','Weave a practice basket','Check the finished basket','Offer it at the community market']),
 'San Teodoro':('Coconut processing',['Gather a fictional coconut harvest','Bring the harvest to processing','Check the processed goods','Deliver the goods to market']),
 'Calapan City':('Farming and commerce',['Receive fictional farm produce','Check the produce','Bring it to the market','Record the trade']),
 'Victoria':('Fruit farming',['Gather fictional orchard produce','Sort the fruit','Pack it for transport','Deliver it to market']),
 'Pola':('Agriculture and fishing',['Receive fictional food supplies','Check the supplies','Allocate household portions','Deliver remaining supplies to market']),
 'Pinamalayan':('Banana-chip making',['Receive fictional bananas','Prepare a batch for processing','Process the practice banana chips','Pack the finished batch']),
 'Gloria':('Banana-chip processing',['Receive fictional bananas','Prepare a batch for processing','Process the practice banana chips','Pack the finished batch']),
 'Bongabong':('Coconut livelihoods',['Gather a fictional coconut harvest','Bring it to processing','Check the finished goods','Deliver the goods to market']),
 'Mansalay':('Coconut and cacao farming',['Receive fictional planting supplies','Allocate them to farm plots','Care for the growing crops','Plan the later harvest']),
 'Bulalacao':('Seaweed-noodle enterprise',['Receive fictional seaweed supplies','Prepare supplies for processing','Process the practice noodles','Pack the finished batch'])}
# Chronological anchors are already recorded in the corresponding heritage facts.
anchors=[('oriental_mindoro_san_teodoro',1929,'Baco and San Teodoro reestablished separately'),('oriental_mindoro_victoria',1953,'Victoria formed from Naujan territory'),('oriental_mindoro_socorro',1963,'Socorro created by Republic Act 3609'),('oriental_mindoro_calapan_city',1998,'Calapan cityhood plebiscite')]
for idx,p in enumerate(profiles):
 pid=p['destinationID'];facts=p['discoveries'];sources=lambda ns:list(dict.fromkeys(s for n in ns for s in facts[n-1]['sourceIDs']));claimids=lambda ns:[facts[n-1]['id'] for n in ns]
 def add(suffix,title,family,ns,tasks,objective,note=''):
  out.append({'id':pid+'__'+suffix,'placeID':pid,'title':title,'family':family,'learningObjective':objective,'whyHere':facts[ns[0]-1]['text'],'claimIDs':claimids(ns),'sourceIDs':sources(ns),'briefing':[facts[n-1]['text'] for n in ns],'designNote':note,'unlock':'Available to all travelers; no purchases or runner completion required','success':'Solve every task. Incorrect submissions offer explanation and retry.','failure':'Leaving saves practice only, without rewards.','difficulty':'Independent reading and multi-step reasoning; untimed','reward':{'coins':40,'xp':30},'artworkRequirements':'Municipal sprite guides; municipal token marks a solved task; investigation seal requires every investigation for this place. Existing passport stamps retain their five-mission rule.','tasks':tasks})
 story=next((f for f in facts if f['evidenceStatus'] in oral),None)
 if story:
  items=[{'id':facts[0]['id'],'label':facts[0]['text'],'answer':'story' if facts[0]['evidenceStatus'] in oral else 'record'},{'id':facts[2]['id'],'label':facts[2]['text'],'answer':'record'},{'id':story['id'],'label':story['text'],'answer':'story'}]
  items=list({i['id']:i for i in items}.values())
  task={'id':'evidence','kind':'classify','prompt':'Classify each statement. An account can carry community meaning without being a verified historical event.','items':items,'categories':[{'id':'record','label':'Reported in documentary sources'},{'id':'story','label':'Local story / oral account'}],'explanation':'Legends and name accounts are presented as remembered narratives. The other statements are source summaries, not independently reverified claims.'}
  follow={'id':'interpret','kind':'decision','prompt':'How should your journal present this name or origin account?','options':[{'id':'certain','label':'Present it as the only proven origin'},{'id':'attributed','label':'Attribute it as a local account and preserve uncertainty'},{'id':'erase','label':'Remove the community account because it is not a dated law'}],'answer':'attributed','explanation':'Attribution respects community memory without claiming historical certainty.'}
  add('name-evidence',p['name']+': name detective','Evidence sorting',[story['suggestedMission'],3],[task,follow],'Distinguish a remembered origin account from documentary evidence.')
 elif p['name'] in ['Calapan City','San Teodoro','Socorro']:
  ordered=[{'id':str(year),'label':f'{year} · {label}'} for _,year,label in anchors]
  tasks=[{'id':'chronology','kind':'sequence','prompt':'Build the regional timeline from earliest to latest. The dates are supplied as evidence.','items':ordered,'answer':[i['id'] for i in ordered],'explanation':'Compare years; 1929 precedes 1953, then 1963, then 1998.'},{'id':'local-event','kind':'decision','prompt':'What does a date in a legal or administrative record establish?','options':[{'id':'event','label':'The specific administrative event described in the record'},{'id':'first','label':'The first time anyone lived in the area'},{'id':'discovery','label':'That the place was previously undiscovered'}],'answer':'event','explanation':'A legal creation or reestablishment date does not date the first settlement or the beginning of community life.'}]
  add('history-docket',p['name']+': history docket','Timeline investigation',[1],tasks,'Place a local administrative event within a sourced regional chronology.')
  # Cross-place dates need their own claim and source links.
  for aid,_,_ in anchors:
   ap=next(x for x in profiles if x['destinationID']==aid);out[-1]['claimIDs'].append(ap['discoveries'][0]['id']);out[-1]['sourceIDs']+=ap['discoveries'][0]['sourceIDs'];out[-1]['briefing'].append(ap['discoveries'][0]['text'])
  out[-1]['claimIDs']=list(dict.fromkeys(out[-1]['claimIDs']));out[-1]['sourceIDs']=list(dict.fromkeys(out[-1]['sourceIDs']))
 else:
  # Non-legend profiles without enough dates receive a source/knowledge task, not an invented timeline.
  task={'id':'context','kind':'match','prompt':'Connect each community topic to its evidence summary.','pairs':[{'id':str(n),'left':facts[n-1]['title'],'right':facts[n-1]['text']} for n in [1,3,4]],'explanation':'History, ways of living, and cultural practice answer different questions about the same community.'}
  add('community-links',p['name']+': community connections','Evidence matching',[1,3,4],[task],'Connect distinct kinds of evidence about the place without inventing chronology.')
 if p['name'] in chains:
  topic,steps=chains[p['name']];items=[{'id':str(i),'label':label} for i,label in enumerate(steps)]
  tasks=[{'id':'process','kind':'sequence','prompt':f'Plan this fictional {topic.lower()} activity in a workable order.','items':items,'answer':[i['id'] for i in items],'explanation':'The simulation moves from inputs through preparation and checking to a useful output. This is not a documented historical workflow.'},{'id':'quality','kind':'decision','prompt':'A delivery is ready, but the goods have not been checked. What should the team do?','options':[{'id':'check','label':'Check the goods before releasing the delivery'},{'id':'rush','label':'Skip checking to finish sooner'},{'id':'claim','label':'Declare the goods checked without looking'}],'answer':'check','explanation':'In this fictional logistics task, checking is a required step before releasing the output.'}]
  add('livelihood-workshop',p['name']+': '+topic.lower()+' workshop','Process planning',[3],tasks,'Translate a documented livelihood into a multi-step planning exercise.','Original teaching scenario inspired by the cited livelihood; not a historical recipe, safety procedure, or claimed customary method.')
 # Environmental scenario deliberately separates game constraints from real local rules.
 env=facts[4]['text'];coastal=any(w in env.lower() for w in ['coastal','mangrove','coral','estuary'])
 if coastal:
  task={'id':'care','kind':'decision','prompt':'Your fictional team must document a water habitat without taking objects from it. Which plan meets both requirements?','options':[{'id':'observe','label':'Record observations and leave living things and objects in place'},{'id':'collect','label':'Take an organism to prove you visited'},{'id':'souvenir','label':'Remove a cultural object as a souvenir'}],'answer':'observe','explanation':'Observation meets the scenario goal while leaving the habitat and cultural objects in place.'}
  firstFamily='Habitat decisions'
 else:
  task={'id':'links','kind':'match','prompt':'Connect each part of the briefing to its role in community life.','pairs':[{'id':'work','left':'Ways of living','right':facts[2]['text']},{'id':'land','left':'Environment','right':facts[4]['text']}],'explanation':'The briefing connects local work with the land and water that help sustain it.'}
  firstFamily='Community resource planning'
 # Different fictional needs follow the local evidence, rather than cloning one water/food puzzle.
 localNeeds={
  'Puerto Galera':[('craft','Practice basket materials',3),('habitat','Habitat observation kit',2)],
  'San Teodoro':[('processing','Coconut-processing practice kit',3),('water','Water-care kit',2)],
  'Baco':[('orchard','Calamansi planting practice kit',2),('river','Riverbank observation kit',3)],
  'Calapan City':[('water','Water-care kit',2),('food','Food-growing support kit',2)],
  'Naujan':[('fishery','Freshwater-fish observation kit',3),('water','Lake-water observation kit',2)],
  'Victoria':[('orchard','Fruit-orchard practice kit',3),('soil','Soil-care practice kit',2)],
  'Socorro':[('crops','Mixed-crop practice kit',3),('water','Shared-water observation kit',2)],
  'Pola':[('craft','Nipa-weaving practice kit',2),('estuary','Estuary observation kit',3)],
  'Pinamalayan':[('processing','Banana-chip practice supplies',3),('river','Riverbank observation kit',2)],
  'Gloria':[('bamboo','Bamboo craft practice kit',3),('river','Riverbank observation kit',2)],
  'Bansud':[('banana','Banana-growing practice kit',2),('river','Riverbank vegetation kit',2)],
  'Bongabong':[('coconut','Coconut-livelihood practice kit',3),('river','River-system observation kit',3)],
  'Roxas':[('calamansi','Calamansi planting practice kit',2),('soil','Crop-soil practice kit',3)],
  'Mansalay':[('coconut','Coconut-farm practice kit',2),('cacao','Cacao planting practice kit',3),('soil','Soil-care practice kit',2)],
  'Bulalacao':[('noodles','Seaweed-noodle practice kit',3),('soil','Soil-care practice kit',2)]}
 needs=localNeeds[p['name']];budgetPoints=sum(n[2] for n in needs)+1
 items=[{'id':('soil' if p['name']=='Calapan City' and role=='food' else role),'label':label,'cost':cost,'roles':[role]} for role,label,cost in needs]
 items += [{'id':'survey','label':'Observation notebook','cost':1,'roles':[]},{'id':'decoration','label':'Decorative sign','cost':4,'roles':[]}]
 budget={'id':'supplies','kind':'budget','prompt':f'Allocate {budgetPoints} fictional supply points. Cover these needs: '+', '.join(n[0] for n in needs)+'. Each required kit must be included; extras are optional.', 'budget':budgetPoints,'requiredRoles':[n[0] for n in needs],'items':items,'explanation':'The required kits are '+', '.join(n[1] for n in needs)+'. Add their costs before choosing extras. The notebook is affordable; decoration cannot replace a required kit. All costs and supplies are original game rules, not real prices.'}
 add('community-care',p['name']+': community care plan',firstFamily,[3,5],[task,budget],'Apply environmental relationships while meeting several explicit resource constraints.','Fictional care scenario and budgets; not current local regulations, engineering advice, or disaster-response guidance.')
# New candidate claims are taught through source comparison, never as factual quiz answers.
notes=json.loads((root/'src/data/research-notes.json').read_text())
cases={
 'calapan-capital-chronology':('Which approach can resolve a disagreement about capital-transfer dates?', ['Compare dated administrative instruments and identify the event each describes','Use the date shown on the largest number of websites','Assume that cityhood and capital transfer are the same event']),
 'socorro-creation-conflict':('How should the 1962/1963 disagreement be investigated?', ['Compare the original Act’s approval and effectivity provisions with the LGU chronology','Pick whichever year appears first in a search result','Treat a later summary as automatically stronger than the legal text']),
 'bulalacao-mait-hypothesis':('What would strengthen an ancient-place identification?', ['Dated textual and archaeological evidence, geographic context, and comparison with alternatives','A resemblance between two place names alone','Selecting the oldest date mentioned in a retelling']),
 'naujan-settlement-inference':('Why can an imported object alone not establish the identity of local inhabitants?', ['Objects can move through trade; context and further evidence are needed','Every object was necessarily made by the person who later owned it','The object’s style automatically identifies all residents']),
 'gloria-settlement-context':('How should a migration account be written when earlier settlement is unclear?', ['Describe the documented arrivals while acknowledging existing communities and evidence gaps','State that nobody lived there before the arrivals','Treat the first date in the summary as the beginning of habitation']),
 'san-teodoro-name-versions':('How should a name explanation involving several similarly named people be checked?', ['Locate original accounts and compare records and attributed oral-history versions','Treat a matching number of names as proof','Publish one version without identifying where it came from']),
 'bansud-name-and-law':('What is needed before assigning the name account to a specific language?', ['A credible language or named-community source supporting that attribution','The general word Mangyan without a specific community source','A guess based only on the sound of the place name'])}
for note in notes:
 if note['id'] not in cases:continue
 question,options=cases[note['id']];p=next(p for p in profiles if p['destinationID']==note['placeID'])
 out.append({'id':note['placeID']+'__source-inquiry','placeID':note['placeID'],'title':p['name']+': source inquiry','family':'Source comparison','learningObjective':'Evaluate what evidence is missing without treating an unverified lead as historical fact.','whyHere':note['statement'],'claimIDs':[],'researchNoteIDs':[note['id']],'sourceIDs':note['sourceIDs'],'briefing':[note['evidenceLabel']+': '+note['statement'],'Verification still needed: '+note['verificationNeeded']],'designNote':'This mission rewards reasoning about evidence. It does not reward accepting the disputed claim or choosing an unverified date.','unlock':'Available to every traveler; no purchases required','success':'Choose a suitable verification method and label the claim’s status correctly.','failure':'Incorrect choices require revision; leaving records practice only.','difficulty':'Untimed source reasoning','reward':{'coins':40,'xp':30},'artworkRequirements':'Use the fictional municipal guide and symbolic municipal token.','tasks':[{'id':'investigate','kind':'decision','prompt':question,'options':[{'id':str(i),'label':option} for i,option in enumerate(options)],'answer':'0','explanation':note['verificationNeeded']},{'id':'status','kind':'decision','prompt':'Before those checks are finished, how should this research lead appear in your journal?','options':[{'id':'pending','label':'Attributed and clearly labeled as unverified or disputed'},{'id':'proven','label':'Presented as confirmed local history'},{'id':'false','label':'Declared false simply because it has not been verified yet'}],'answer':'pending','explanation':'An unresolved claim is neither established fact nor automatically false. Preserve attribution and explain what evidence is missing.'}]})
(root/'src/data/investigations.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Generated',len(out),'investigations; families:',sorted(set(m['family'] for m in out)))
