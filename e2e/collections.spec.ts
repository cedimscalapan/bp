import {test,expect} from '@playwright/test';

test('passport paging, filters, cards and destination navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');await page.getByRole('button',{name:'Let’s explore'}).click();
 await page.getByRole('button',{name:'Passport',exact:true}).click();
 await expect(page.getByRole('heading',{name:'KaPamana Passport'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Previous passport pages'})).toBeDisabled();
 await page.getByRole('button',{name:'Next passport pages'}).click();
 await expect(page.locator('.passport-pagination>span')).toHaveText(/^2 \/ /);
 await page.getByRole('button',{name:'Mindoro',exact:true}).click();
 await expect(page.locator('.passport-pagination>span')).toHaveText('1 / 8');
 await page.getByRole('button',{name:'Earned',exact:true}).click();
 await expect(page.getByRole('button',{name:'Next passport pages'})).toBeDisabled();
 await page.getByRole('button',{name:'Cards',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Your first stamp is waiting.'})).toBeVisible();
 await page.getByRole('button',{name:'Explore Mindoro stamps'}).click();
 await expect(page.locator('.passport-card-grid .destination-leaf')).toHaveCount(15);
 await page.getByRole('button',{name:/Calapan City, 0 of 5 missions/}).click();
 await expect(page.locator('ion-modal .detail h1')).toHaveText('Calapan City');
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'Close Passport',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Choose your adventure'})).toBeVisible();
});

test('Buddy selection, upgrades and badge customization persist',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');await page.getByRole('button',{name:'Let’s explore'}).click();
 await page.getByRole('button',{name:'Claim 150 coins'}).click();
 await page.getByRole('button',{name:'Buddies',exact:true}).click();
 await expect(page.locator('.team-tile')).toHaveCount(9);
 await page.getByRole('button',{name:'Open Dog profile',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Bone Toss',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Choose Dog as team lead'}).click();
 await expect(page.getByRole('button',{name:'Your team lead',exact:false})).toBeDisabled();
 await page.getByRole('button',{name:/UPGRADE.*150/}).click();
 await expect(page.locator('.buddy-profile-hero p')).toHaveText('1 / 3 skill upgrades');
 await expect(page.getByRole('button',{name:/UPGRADE.*300/})).toBeDisabled();
 await page.getByRole('button',{name:'Customize',exact:true}).click();
 await page.getByRole('button',{name:'Badge color #4bb5dc'}).click();
 await expect(page.getByRole('button',{name:'Badge color #4bb5dc'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Close Buddy profile'}).click();
 await page.reload();await page.getByRole('button',{name:'Buddies',exact:true}).click();
 await page.getByRole('button',{name:'Open Dog profile, team lead'}).click();
 await expect(page.locator('.buddy-profile-hero p')).toHaveText('1 / 3 skill upgrades');
 await page.getByRole('button',{name:'Customize',exact:true}).click();
 await expect(page.getByRole('button',{name:'Badge color #4bb5dc'})).toHaveAttribute('aria-pressed','true');
});
