import {test,expect} from '@playwright/test';
import missions from '../src/data/investigations.json' with {type:'json'};
import type {Investigation,Task} from '../src/investigations';
const find=(suffix:string)=>(missions as Investigation[]).find(m=>m.id==='oriental_mindoro_calapan_city__'+suffix)!;
async function open(page:any,mission:Investigation){
 await page.getByRole('button',{name:/YOUR NEXT GREAT DISCOVERY/}).click();await page.locator('.destination-card').first().click();await page.locator('.investigation-menu').getByRole('button',{name:new RegExp(mission.title)}).click();await page.getByRole('button',{name:'Begin investigation →',exact:true}).click();
}
async function solve(page:any,task:Task){
 if(task.kind==='sequence'){for(const id of task.answer){await page.getByRole('button',{name:task.items.find(i=>i.id===id)!.label,exact:true}).focus();await page.keyboard.press('Enter');}}
 else if(task.kind==='decision')await page.getByRole('button',{name:task.options.find(o=>o.id===task.answer)!.label,exact:true}).click();
 else if(task.kind==='budget'){for(const role of task.requiredRoles){const item=task.items.find(i=>i.roles.includes(role))!;await page.getByRole('button',{name:new RegExp(item.label)}).click();}}
 else if(task.kind==='match'){for(const pair of task.pairs)await page.getByLabel('Match '+pair.left,{exact:true}).selectOption(pair.id);}
 else{for(const [i,item]of task.items.entries())await page.getByLabel('Classify statement '+(i+1),{exact:true}).selectOption(item.answer);}
 await page.getByRole('button',{name:'Check my plan',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Task solved. Explain what you learned, then continue.');
}
test('timeline investigation rewards once and records review without changing runner stamps',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Let’s explore'}).click();const mission=find('history-docket');
 for(let review=0;review<2;review++){
  await open(page,mission);
  if(review===0){await page.getByRole('button',{name:'Check my plan',exact:true}).click();await expect(page.getByRole('status')).toContainText('does not meet');await page.getByRole('button',{name:/Show a hint/}).click();}
  for(const [i,task] of mission.tasks.entries()){await solve(page,task);await page.getByRole('button',{name:i+1===mission.tasks.length?'Finish investigation':'Next task →',exact:true}).click();}
  await page.getByRole('button',{name:'Save investigation →',exact:true}).click();await page.reload();
 }
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.buddyport.ionic.v1')!));expect(data.coins).toBe(40);expect(data.completed).toEqual({});expect(data.investigations[mission.id]).toMatchObject({completions:2,unassistedCompletions:1,reviews:1,hints:1,mistakes:1});
});
test('budget planning rejects over-budget selections and unfinished games save practice only',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Let’s explore'}).click();const mission=find('community-care');await open(page,mission);await solve(page,mission.tasks[0]);await page.getByRole('button',{name:'Next task →',exact:true}).click();
 for(const label of ['Water-care kit','Food-growing support kit','Decorative sign'])await page.getByRole('button',{name:new RegExp(label)}).click();
 await page.getByRole('button',{name:'Check my plan',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'That plan does not meet'})).toHaveText('That plan does not meet every requirement yet. Revise it or ask for a hint.');
 await page.getByRole('button',{name:'Leave',exact:true}).click();await page.getByRole('button',{name:'Leave and save practice',exact:true}).click();await page.reload();const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.buddyport.ionic.v1')!));expect(data.coins).toBe(0);expect(data.investigations[mission.id]).toMatchObject({completions:0,mistakes:1});
});
test('unverified research leads are labeled and their inquiry rewards evidence reasoning',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Let’s explore'}).click();const mission=find('source-inquiry');await open(page,mission);
 await expect(page.getByText('Which approach can resolve a disagreement about capital-transfer dates?',{exact:true})).toBeVisible();
 const first=mission.tasks[0];if(first.kind!=='decision')throw Error('Expected a source-comparison decision');await page.getByRole('button',{name:first.options.find(o=>o.id!==first.answer)!.label,exact:true}).click();await page.getByRole('button',{name:'Check my plan',exact:true}).click();await expect(page.getByRole('status')).toContainText('does not meet');await expect(page.getByRole('button',{name:'Next task →',exact:true})).toHaveCount(0);
 for(const [i,task]of mission.tasks.entries()){await solve(page,task);await page.getByRole('button',{name:i+1===mission.tasks.length?'Finish investigation':'Next task →',exact:true}).click();}
 await page.getByRole('button',{name:'Save investigation →',exact:true}).click();await page.reload();await page.getByRole('button',{name:/YOUR NEXT GREAT DISCOVERY/}).click();await page.locator('.destination-card').first().click();const notes=page.locator('.research-notes');await expect(notes.getByRole('heading',{name:'Research in progress'})).toBeVisible();await notes.getByText('Capital-transfer chronology remains unresolved',{exact:true}).click();await expect(notes.getByText('Reported source conflict; dates unresolved',{exact:true})).toBeVisible();
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.buddyport.ionic.v1')!));expect(data.investigations[mission.id]).toMatchObject({completions:1,unassistedCompletions:0,mistakes:1});expect(data.completed).toEqual({});
});
