import {test,expect} from '@playwright/test';
import {freshSave} from '../src/model';
test('twelve runners replace investigations and old stamps survive the campaign expansion',async({page})=>{
 const save:any=freshSave();save.onboarded=true;save.settings.music=false;delete save.runnerCampaignVersion;delete save.legacyStamps;
 for(let n=1;n<=5;n++)save.completed[`oriental_mindoro_calapan_city_level_${n}`]=2;
 await page.addInitScript(data=>{localStorage.setItem('CapacitorStorage.buddyport.ionic.v1',JSON.stringify(data));},save);
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('img',{name:'Travel jeepney',exact:true})).toHaveAttribute('src','/assets/travel_jeepney.webp');await expect(page.getByRole('img',{name:'Travel airplane',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Passport',exact:true}).click();await expect(page.getByRole('button',{name:'Calapan City, stamp earned. Open destination',exact:true})).toBeVisible();await expect(page.locator('.investigation-seal')).toHaveCount(0);
 await page.getByRole('button',{name:'Calapan City, stamp earned. Open destination',exact:true}).click();await expect(page.locator('.level-row')).toHaveCount(12);await expect(page.locator('.investigation-menu')).toHaveCount(0);await expect(page.locator('.level-row').nth(5)).toBeEnabled();await expect(page.locator('.level-row').nth(6)).toBeDisabled();
 await page.getByText('Read about history, culture, and origins',{exact:true}).click();await expect(page.locator('.cultural-identity')).toContainText('Local food-making and sharing');await expect(page.locator('.cultural-identity')).toContainText('does not establish a single discoverer');await page.getByText('Read about history, culture, and origins',{exact:true}).click();
 await page.locator('.level-row').nth(5).click();await page.getByRole('button',{name:'Continue →',exact:true}).click();await expect(page.getByRole('heading',{name:'Name origins trail',exact:true})).toBeVisible();await expect(page.locator('.mission-fact')).toContainText('do not establish a verified etymology');await expect(page.getByRole('button',{name:'Start adventure',exact:true})).toBeVisible();
});
