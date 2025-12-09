import { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import assert from 'assert';
import { Builder, By, until, WebDriver, Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';

setDefaultTimeout(120_000);
const DRAW_URL = 'http://localhost:4200/draw';

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless');
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--disable-dev-shm-usage');
chromeOptions.addArguments('--disable-gpu');
chromeOptions.addArguments('--window-size=1920,1080');

if (process.env.CHROME_BIN) {
  chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
}

const driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build();

Given('I am on the Draw2d page', async function () {
  assert(driver);
  await driver.get(DRAW_URL);
  const canvas = await driver.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  await driver.wait(until.elementIsVisible(canvas), 20_000);
});

Then('the canvas should be visible', async function () {
  assert(driver);
  const canvas = await driver.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  assert.strictEqual(await canvas.isDisplayed(), true);
});

Then('the canvas drawing surface should be greater than zero', async function () {
  assert(driver);
  const size = await driver.executeScript(() => {
    const c = document.querySelector('canvas.canv') as HTMLCanvasElement | null;
    return c ? { width: c.width, height: c.height, clientWidth: c.clientWidth, clientHeight: c.clientHeight } : null;
  });
  assert.ok(size, 'Canvas element not found');
  const { width, height } = size as any;
  assert.ok(width > 0, 'canvas.width should be > 0');
  assert.ok(height > 0, 'canvas.height should be > 0');
});

Then('the property size panel should be visible', async function () {
  assert(driver);
  const sidenav = await driver.findElement(By.css('#property-size'));
  assert.strictEqual(await sidenav.isDisplayed(), true);
});

When('I draw a rectangle from {int},{int} to {int},{int} on the canvas', async function (x1: number, y1: number, x2: number, y2: number) {
  assert(driver);
  const canvas = await driver.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  await driver.wait(until.elementIsVisible(canvas), 20_000);

  await driver.actions({ async: true })
    .move({ origin: canvas, x: x1, y: y1 })
    .press()
    .move({ origin: canvas, x: x2, y: y2 })
    .release()
    .perform();

  await driver.sleep(300);
});

When('I switch to the select tool', async function () {
  assert(driver);
  try {
    const toggle = await driver.wait(until.elementLocated(By.css('mat-button-toggle[value="select"]')), 5_000);
    await toggle.click();
    return;
  } catch {
    // fall back
  }
  const selectIconBtn = await driver.findElement(
    By.xpath("//mat-button-toggle[.//mat-icon[normalize-space(text())='select_all']]")
  );
  await selectIconBtn.click();
});

When('I click at {int},{int} on the canvas', async function (x: number, y: number) {
  assert(driver);
  const canvas = await driver.wait(until.elementLocated(By.css('canvas.canv')), 20_000);
  await driver.wait(until.elementIsVisible(canvas), 20_000);

  await driver.actions({ async: true })
    .move({ origin: canvas, x, y })
    .click()
    .perform();
});

Then('the width and height inputs should be visible', async function () {
  assert(driver);
  const widthInput = await driver.wait(until.elementLocated(By.css('input[title="width"]')), 10_000);
  const heightInput = await driver.wait(until.elementLocated(By.css('input[title="height"]')), 10_000);
  assert.strictEqual(await widthInput.isDisplayed(), true);
  assert.strictEqual(await heightInput.isDisplayed(), true);
});

When('I clear all elements in the UI', async function () {
  assert(driver);
  const clearBtn = await driver.findElement(
    By.xpath("//button[.//mat-icon[normalize-space(text())='clear_all']]")
  );
  await clearBtn.click();
  await driver.sleep(300);
});

Then('the width and height inputs should not be present', async function () {
  assert(driver);
  const inputs = await driver.findElements(By.css('input[title="width"], input[title="height"]'));
  assert.strictEqual(inputs.length, 0, 'size inputs should be removed after clearing');
});

