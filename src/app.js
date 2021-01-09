const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');

async function launch() {
  const instance = new Builder().forBrowser('chrome').build();
  console.log('进程启动成功');
  return instance;
}

async function waitUntilLogin(driver) {
  await driver.get(`https://mp.weixin.qq.com/`);
  console.log('等待登录');
  return new Promise(resolve => {
    const timer = setInterval(async () => {
      const url = await driver.getCurrentUrl();
      if (/wxamp\/index\/index/.test(url)) {
        clearInterval(timer);
        console.log('登录成功');
        resolve();
      }
    }, 3000);
  });
}

async function navigateToMp(driver) {
  const url = await driver.getCurrentUrl();
  const query = url.slice(url.indexOf('?'));
  const target = `https://mp.weixin.qq.com/wxamp/basicprofile/relation${query}`;
  console.log('正在跳转公众号设置');
  await driver.get(target);
}

function getIdList() {
  console.log('正在获取 ID');
  const idList = fs.readFileSync('./data.txt').toString().trim().split('\n');
  console.log('获取到的 ID：', idList);
  return idList;
}

async function unbind(driver, idList) {
  console.log('开始解绑，拿起手机扫一扫');
  for (const id of idList) {
    const page = Math.ceil(id / 10);
    const key = (id - 1) % 10 + 1;
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
    console.log(id, 'ok');
  }
}

async function destroy(driver) {
  console.log('正在退出进程');
  await driver.quit();
}

(async function execute() {
  let driver = await launch();
  try {
    await waitUntilLogin(driver);
    await navigateToMp(driver);
    const idList = getIdList();
    await unbind(driver, idList);
  } catch (e) {
    console.error(e);
  } finally {
    await destroy(driver);
  }
})();
