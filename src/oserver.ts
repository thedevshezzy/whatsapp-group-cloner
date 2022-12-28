import dotenv from 'dotenv';

import puppeteer from 'puppeteer';

(async () => {
  // await page.screenshot({ path: 'example.png' });
  // await browser.close();
})();

dotenv.config();

const { GROUP_NAME } = process.env;

export let setToken = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './myChromeSession',
    args: ['--disable-session-crashed-bubble'],
  });
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle2' });

  // await page.type('#username', 'scott');

  // await page.waitForSelector('div[data-testid="qrcode"]', {
  //   visible: true,
  // });

  await page.waitForNavigation();

  await delay(2000);

  const group = await page.waitForSelector(`span[title="${GROUP_NAME}"]`);

  console.log(group);

  let rect = await page.evaluate((el) => {
    if (el) {
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, group);

  console.log(rect);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  await delay(2000);

  const info = await page.waitForSelector(
    `div[data-testid="conversation-info-header"]`
  );

  console.log(info);

  rect = await page.evaluate((el) => {
    if (el) {
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, info);

  console.log(rect);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  await delay(2000);

  const section = await page.waitForSelector(
    `section[data-testid="group-info-drawer-body"]`
  );

  console.log(section);

  if (!section) {
    throw new Error('Section not found');
  }

  let buttons = await section.$$('button');

  let seeAll = buttons[buttons.length - 1];

  seeAll.click();

  await delay(2000);

  let numbers = await page.$$(
    'div[data-animate-modal-popup="true"] span.ggj6brxn.gfz4du6o.r7fjleex.g0rxnol2.lhj4utae.le5p0ye3.l7jjieqr.i0jNr'
  );

  console.log(numbers);

  for (let number of numbers) {
    let text = await number.evaluate((el) => el.textContent);
    console.log(text);
  }

  // page.close();

  // browser.close();
};

setToken();

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
