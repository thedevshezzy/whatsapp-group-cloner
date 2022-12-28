import puppeteer from 'puppeteer';
import { parseAsync } from 'json2csv';
import fs from 'fs';
import { CSVContact, JSONContact } from './interfaces';
import { delay } from './utilities';
import { CONTACT_PERFIX, GROUP_NAME, WHATSAPP_URL } from './globals';

export let exportContacts = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './myChromeSession',
    args: ['--disable-session-crashed-bubble'],
  });
  const page = await browser.newPage();
  await page.goto(WHATSAPP_URL, { waitUntil: 'networkidle2' });

  await page.waitForNavigation();

  await delay(2000);

  await page.type('div[data-testid="chat-list-search"]', `${GROUP_NAME}`);

  await delay(1000);

  const group = await page.waitForSelector(`span[title="${GROUP_NAME}"]`);

  console.log(group);

  let rect = await page.evaluate((el) => {
    if (el) {
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }
  }, group);

  if (!rect) {
    throw new Error('Coordinates not found');
  }

  await page.mouse.click(rect.x, rect.y);

  await delay(2000);

  const chatHeader = await page.waitForSelector(
    '[data-testid="chat-subtitle"] span'
  );

  if (!chatHeader) {
    throw new Error('Header not found');
  }

  let numbersString = await chatHeader.evaluate((el) =>
    el.getAttribute('title')
  );

  if (!numbersString) {
    throw new Error('Numbers not found');
  }

  let csvList = numbersString
    .replace(/ /g, '')
    .replace(/[a-zA-Z]/gi, '')
    .replace(/\+92/g, '0')
    .split(',')
    .filter((n) => n != '');

  let jsonList = numbersString
    .replace(/ /g, '')
    .replace(/You/gi, '')
    .replace(/\+/g, '')
    .split(',')
    .filter((n) => n != '');

  let csvContacts: CSVContact[] = [];
  let jsonContacts: JSONContact[] = [];

  csvList.forEach((item, index) => {
    let csvContact: CSVContact = {
      Name: `${CONTACT_PERFIX}${index}`,
      'Group Membership': '* myContacts',
      'Phone 1 - Type': 'Mobile',
      'Phone 1 - Value': item.replace(/^(.{4})(.*)$/, '$1 $2'),
    };

    csvContacts.push(csvContact);
  });

  jsonList.forEach((item, index) => {
    let jsonContact: JSONContact = {
      name: `${CONTACT_PERFIX}${index}`,
      phone: item,
    };

    jsonContacts.push(jsonContact);
  });

  console.log(csvContacts);
  console.log(jsonContacts);

  var fields = [
    'Name',
    'Given Name',
    'Additional Name',
    'Family Name',
    'Yomi Name',
    'Given Name Yomi',
    'Additional Name Yomi',
    'Family Name Yomi',
    'Name Prefix',
    'Name Suffix',
    'Initials',
    'Nickname',
    'Short Name',
    'Maiden Name',
    'Birthday,	Gender',
    'Location',
    'Billing Information',
    'Directory Server',
    'Mileage',
    'Occupation',
    'Hobby',
    'Sensitivity',
    'Priority',
    'Subject',
    'Notes',
    'Language',
    'Photo',
    'Group Membership',
    'Phone 1 - Type',
    'Phone 1 - Value',
  ];

  const data = await parseAsync(csvContacts, {
    fields: fields,
  });

  fs.writeFile('exports/contacts.csv', data, 'utf8', (err) => {
    if (err) {
      console.log(
        'Some error occured - file either not saved or corrupted file saved.'
      );
      console;
    } else {
      console.log('CSV saved!');
    }
  });

  fs.writeFile(
    'exports/contacts.json',
    JSON.stringify(jsonContacts),
    'utf8',
    (err) => {
      if (err) {
        console.log(
          'Some error occured - file either not saved or corrupted file saved.'
        );
        console;
      } else {
        console.log('JSON saved!');
      }
    }
  );

  page.close();

  browser.close();
};
