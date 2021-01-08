const { Builder, By, Key, until } = require('selenium-webdriver');
const qs = require('qs');
// 注意 ID 要倒序
const idList = [1];

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get(`https://mp.weixin.qq.com/`);
    const { cookies, token } = await new Promise((resolve, reject) => {
      let count = 0;
      const timer = setInterval(async () => {
        const url = await driver.getCurrentUrl();
        if (/wxamp\/basicprofile\/relation/.test(url)) {
          const cookies = await driver.manage().getCookies();
          const { token } = qs.parse(url.split('?')[1]);
          if (cookies && cookies.length > 5) {
            clearInterval(timer);
            resolve({ cookies, token });
          }
        }
        count++;
        if (count > 10) {
          clearInterval(timer);
          reject('登录超时');
        }
      }, 3000);
    });
    for (const item of cookies) {
      await driver.manage().addCookie({ name: item.name, value: item.value });
    }
    await driver.get(`https://mp.weixin.qq.com/wxamp/basicprofile/relation?token=${token}&lang=zh_CN`);
    for (let i = 0; i < idList.length; i++) {
      const page = Math.ceil(idList[i] / 10);
      const key = (idList[i] - 1) % 10 + 1;
      const input = await driver.wait(until.elementLocated(By.css('.weui-desktop-pagination__input')), 10000);
      await input.sendKeys(page, Key.ENTER);
      await driver.sleep(3000);
      const boxes = await driver.wait(until.elementsLocated(By.css('.mod_default_box')), 10000);
      const rows = await boxes[1].findElements(By.css('tbody tr'));
      const cell = await rows[key - 1].findElement(By.css('.table_cell .js_mp_unbind'));
      await cell.click();
      await driver.wait(async () => {
        const target = await driver.findElement(By.css('.weui-desktop-pagination__input'));
        return await target.getAttribute("value") === '';
      }, 30000);
      console.log(idList[i], 'ok');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await driver.quit();
  }
})();
