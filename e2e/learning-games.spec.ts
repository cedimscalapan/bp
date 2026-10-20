import {test,expect} from '@playwright/test';
test('learning game difficulty, correct feedback and completed session persist',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Let’s explore'}).click();await page.getByRole('button',{name:'Learn',exact:true}).click();await page.getByRole('button',{name:/Play a learning challenge/}).click();
 await page.getByRole('button',{name:/Starter/}).click();await page.getByRole('button',{name:/Shape detective/}).click();
 const names=['a','i','u','ka','ga','nga','ta','da','na','pa','ba','ma','ya','ra','la','wa','sa','ha'];
 for(let n=0;n<5;n++){
  const prompt=await page.locator('.learning-game-round>h2').innerText();const name=prompt.match(/“(.+)”/)![1];const glyph=String.fromCodePoint(0x1720+names.indexOf(name));await page.getByRole('button',{name:`Choose ${glyph}`,exact:true}).click();await expect(page.getByRole('status')).toHaveText('You found it!');await page.getByRole('button',{name:n===4?'Finish challenge':'Next round →',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'Challenge complete!'})).toBeVisible();await expect(page.getByText('5 / 5 rounds solved on the first try.')).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Learn',exact:true}).click();await page.getByRole('button',{name:/Play a learning challenge/}).click();await expect(page.getByText(/Completed game levels: 1 \/ 9/)).toBeVisible();
 await page.getByRole('button',{name:/Advanced.*Suggested ages 12/}).click();await page.getByRole('button',{name:/Word builder/}).click();await expect(page.locator('.game-round-header>b')).toHaveText('Round 1 / 10');
 const word=(await page.locator('.learning-game-round>h2').innerText()).match(/“(.+)”/)![1];
 for(const letter of word){await page.locator('.learning-game-options button:not(:disabled)').filter({hasText:new RegExp('^'+letter.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first().click();}
 await page.getByRole('button',{name:'Check word',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Word completed!');
});
