const {Builder, By, Key, until} = require('selenium-webdriver');
// 注意 ID 要倒序，留意更新 cookie 和 token
const token = 96709732;
const cookie = 'cookie';
const idList = [10,9,8];

function getCookies() {
  const list = cookie.split('; ');
  const result = list.map(i=>{
    const [name,value] = i.replace(/=/, '; ').split('; ');
    return {name,value};
  });
  return result;
}
(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get(`https://mp.weixin.qq.com/wxamp/basicprofile/relation?token=${token}&lang=zh_CN`);
    const cookies = getCookies();
    for (const item of cookies) {
      await driver.manage().addCookie({ name:item.name, value: item.value});
    }
    await driver.get(`https://mp.weixin.qq.com/wxamp/basicprofile/relation?token=${token}&lang=zh_CN`);
    for (let i = 0; i < idList.length; i++) {
      const page = Math.ceil(idList[i] / 10);
      const key = (idList[i]-1) % 10+1;
      const input = await driver.wait(until.elementLocated(By.css('.weui-desktop-pagination__input')), 10000);
      await input.sendKeys(page, Key.ENTER);
      await new Promise(resolve => {
        setTimeout(resolve, 3000);
      });
      const boxes = await driver.wait(until.elementsLocated(By.css('.mod_default_box')), 10000);
      const rows = await boxes[1].findElements(By.css('tbody tr'));
      const cell = await rows[key-1].findElement(By.css('.table_cell .js_mp_unbind'));
      await cell.click();
      await driver.wait(async()=>{
        try{
          const target = await driver.findElement(By.css('.weui-desktop-pagination__input'));
          return await target.getAttribute("value")==='';
        } catch (e) {
          return false;
        }
      }, 30000);
      console.log(idList[i],'ok');
    }
  }
  finally{
    await driver.quit();
  }
})();
