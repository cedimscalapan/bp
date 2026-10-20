import {test,expect} from '@playwright/test';
test('special ability pauses the scene, shows the selected skill and resumes on dismissal',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Let’s explore'}).click();
 await page.getByRole('button',{name:/YOUR NEXT GREAT DISCOVERY/}).click();await page.locator('.destination-card').first().click();await page.locator('.level-row').first().click();
 await page.locator('.departure-buddies button').filter({has:page.getByRole('heading',{name:'Dog',exact:true})}).click();await page.getByRole('button',{name:'Continue →',exact:true}).click();await page.getByRole('button',{name:'Start adventure',exact:true}).click();
 await page.getByRole('button',{name:'Bone Toss, activate',exact:true}).click();
 const overlay=page.getByRole('dialog',{name:'Bone Toss',exact:true});await expect(overlay).toBeVisible();
 await expect(overlay.getByText('Interrupt incoming trouble.')).toBeVisible();
 const frozenTime=await page.locator('.hud-clock').innerText();await page.waitForTimeout(300);await expect(page.locator('.hud-clock')).toHaveText(frozenTime);
 await page.keyboard.press('ArrowLeft');await expect(page.locator('.player')).toHaveCSS('left',await page.locator('.game-stage').evaluate(e=>`${e.clientWidth*.5}px`));
 await page.getByRole('button',{name:'Continue adventure →'}).click();await expect(overlay).toHaveCount(0);
 await expect(page.locator('.hud-clock')).not.toHaveText(frozenTime);await expect(page.locator('.skill-hud')).toBeDisabled();
 await page.getByRole('button',{name:'Ⅱ Pause',exact:true}).click();await expect(page.getByRole('heading',{name:'Adventure paused'})).toBeVisible();
});
