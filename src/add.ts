import puppeteer from 'puppeteer';
import fs from 'fs';
import { JSONContact } from './interfaces';
import { delay } from './utilities';
import {
  WHATSAPP_URL,
  CLONE_NAME,
  ELEMENT_NAME_PREFIX,
  ELEMENT_NAME_SUFFIX,
} from './globals';

const {} = process.env;

export let bulkAdd = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './myChromeSession',
    args: ['--disable-session-crashed-bubble'],
  });
  const page = await browser.newPage();
  await page.goto(WHATSAPP_URL, { waitUntil: 'networkidle2' });

  await page.waitForNavigation();

  await delay(2000);

  await page.type('div[data-testid="chat-list-search"]', `${CLONE_NAME}`);

  await delay(1000);

  const group = await page.waitForSelector(`span[title="${CLONE_NAME}"]`);

  var rect = await page.evaluate((el) => {
    if (el) {
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, group);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  await delay(1000);

  const info = await page.waitForSelector(
    `div[data-testid="conversation-info-header"]`
  );

  rect = await page.evaluate((el) => {
    if (el) {
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, info);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  await delay(1000);

  const section = await page.waitForSelector(
    `section[data-testid="group-info-drawer-body"]`
  );

  if (!section) {
    throw new Error('Section not found');
  }

  let addButton = await page.waitForSelector(
    '#app > div > div > div._3ArsE > div.ldL67._1bLj8 > span > div > span > div > div > section > div._1is6W.ZIBLv.g0rxnol2.tvf2evcx.oq44ahr5.lb5m6g5c.brac1wpa.lkjmyc96.i4pc7asj.bcymb0na.przvwfww.e8k79tju > div.tt8xd2xn.dl6j7rsh.mpdn4nr2.avk8rzj1 > div:nth-child(1)'
  );

  rect = await page.evaluate((el) => {
    if (el) {
      el.scrollIntoView();
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, addButton);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  await delay(1000);

  let contacts: JSONContact[] = [];

  contacts = JSON.parse(fs.readFileSync('exports/contacts.json', 'utf8'));

  console.log(contacts);

  for (let contact of contacts) {
    await page.keyboard.type(contact.name);

    await delay(1000);

    let contactElement = await page.$(
      `[data-testid="${ELEMENT_NAME_PREFIX}${contact.phone}${ELEMENT_NAME_SUFFIX}"]`
    );

    if (contactElement) {
      rect = await page.evaluate((el) => {
        if (el) {
          el.scrollIntoView();
          const { x, y } = el.getBoundingClientRect();
          return { x, y };
        }
      }, contactElement);

      if (!rect) {
        throw new Error('Coordinates not found');
      }

      await page.mouse.click(rect.x, rect.y);
    }

    for (let i = 0; i <= contact.name.length; i++) {
      await page.keyboard.press('Backspace');
    }

    await delay(500);
  }

  let submitButton = await page.$('span[data-testid="checkmark-medium"]');

  if (!submitButton) {
    throw new Error('Submit Button not found');
  }

  rect = await page.evaluate((el) => {
    if (el) {
      el.scrollIntoView();
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, submitButton);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  let cofirmButton = await page.$('div[data-testid="popup-controls-ok"]');

  if (!cofirmButton) {
    throw new Error('Confirm Button not found');
  }

  rect = await page.evaluate((el) => {
    if (el) {
      el.scrollIntoView();
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, cofirmButton);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  page.close();

  browser.close();
};
