import {test,expect} from '@playwright/test';
import {freshSave} from '../src/model';
test('earned milestones can be claimed once and the journey continues from saved progress',async({page})=>{
 const save=freshSave();save.onboarded=true;save.settings.music=false;save.completed.oriental_mindoro_calapan_city_level_1=1;
 await page.addInitScript(data=>{if(!localStorage.getItem('CapacitorStorage.buddyport.ionic.v1'))localStorage.setItem('CapacitorStorage.buddyport.ionic.v1',JSON.stringify(data));},save);
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('region',{name:'Your heritage journey'})).toContainText('1/180 missions');
 await expect(page.getByRole('region',{name:'Your heritage journey'})).toContainText('Mission 2 of 12');
 await page.getByRole('button',{name:'Missions',exact:true}).click();
 const badge=page.locator('.achievement-card').filter({has:page.getByRole('heading',{name:'First memory',exact:true})});
 await badge.getByRole('button',{name:'Claim 50 coins',exact:true}).click();await expect(badge.getByRole('button',{name:'Claimed',exact:true})).toBeDisabled();
 await page.reload();await page.getByRole('button',{name:'Missions',exact:true}).click();await expect(badge.getByRole('button',{name:'Claimed',exact:true})).toBeDisabled();
 await expect(page.locator('.achievement-card').filter({has:page.getByRole('heading',{name:'Trail builder',exact:true})}).getByRole('button')).toBeDisabled();
 await expect(page.locator('.achievement-grid')).toBeVisible();
 expect(await page.locator('.achievement-grid').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.setViewportSize({width:1280,height:900});
 expect(await page.locator('.achievement-grid').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.getByRole('button',{name:'Adventure',exact:true}).click();await page.getByRole('button',{name:'Continue journey →',exact:true}).click();await expect(page.getByRole('heading',{name:'Choose Your Buddy',exact:true})).toBeVisible();
});
