/* Selenium + Mocha E2E tests for Draw2d */
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

const BASE_URL = 'http://localhost:4200/draw';

describe('Draw2d E2E', function () {
  this.timeout(90000);

  /** @type {import('selenium-webdriver').ThenableWebDriver} */
  let driver;

  before(async () => {
    const options = new chrome.Options()
      // Prefer new headless for modern Chrome; also set window size for canvas
      .addArguments('--headless=new', '--window-size=1280,900', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage');

    // Use Chromium binary if CHROME_BIN is set (for Docker)
    if (process.env.CHROME_BIN) {
      options.setChromeBinaryPath(process.env.CHROME_BIN);
    }

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('loads the Draw2d page and renders the canvas', async () => {
    await driver.get(BASE_URL);

    // Wait for Angular app and the canvas to be present
    const canvas = await driver.wait(until.elementLocated(By.css('canvas.canv')), 20000);
    await driver.wait(until.elementIsVisible(canvas), 20000);

    // Verify canvas has non-zero drawing surface size
    const size = await driver.executeScript(() => {
      const c = document.querySelector('canvas.canv');
      return { width: c.width, height: c.height, clientWidth: c.clientWidth, clientHeight: c.clientHeight };
    });

    expect(size.width, 'canvas.width should be > 0').to.be.greaterThan(0);
    expect(size.height, 'canvas.height should be > 0').to.be.greaterThan(0);

    // Verify the side property panel container exists
    const sidenav = await driver.findElement(By.css('#property-size'));
    expect(await sidenav.isDisplayed()).to.equal(true);
  });

  it('can draw a rectangle and then select it to show size inputs', async () => {
    await driver.get(BASE_URL);

    const canvas = await driver.wait(until.elementLocated(By.css('canvas.canv')), 20000);
    await driver.wait(until.elementIsVisible(canvas), 20000);

    // Draw a rectangle using drag (default tool is crop_square)
    // Drag from (50,50) to (200,150) relative to the canvas
    await driver.actions({ async: true })
      .move({ origin: canvas, x: 50, y: 50 })
      .press()
      .move({ origin: canvas, x: 200, y: 150 })
      .release()
      .perform();

    // Small pause to allow draw/render
    await driver.sleep(300);

    // Switch to "select" tool
    // Try clicking the host toggle; fall back to clicking the inner icon if needed
    try {
      const selectToggle = await driver.wait(
        until.elementLocated(By.css('mat-button-toggle[value="select"]')),
        5000
      );
      await selectToggle.click();
    } catch (e) {
      const selectIconBtn = await driver.findElement(
        By.xpath("//mat-button-toggle[.//mat-icon[normalize-space(text())='select_all']]")
      );
      await selectIconBtn.click();
    }

    // Click roughly in the center of the drawn rectangle to select it
    await driver.actions({ async: true })
      .move({ origin: canvas, x: 125, y: 100 })
      .click()
      .perform();

    // Wait for the width/height inputs to appear in the property panel
    const widthInput = await driver.wait(until.elementLocated(By.css('input[title="width"]')), 10000);
    const heightInput = await driver.wait(until.elementLocated(By.css('input[title="height"]')), 10000);

    expect(await widthInput.isDisplayed()).to.equal(true);
    expect(await heightInput.isDisplayed()).to.equal(true);

    // Clear all elements and verify the inputs disappear
    const clearBtn = await driver.findElement(
      By.xpath("//button[.//mat-icon[normalize-space(text())='clear_all']]")
    );
    await clearBtn.click();

    // Give time for the UI to update and redraw
    await driver.sleep(300);

    const inputsAfterClear = await driver.findElements(By.css('input[title="width"], input[title="height"]'));
    expect(inputsAfterClear.length, 'size inputs should be removed after clearing').to.equal(0);
  });
});
