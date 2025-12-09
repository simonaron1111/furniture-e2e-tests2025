import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless');
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--disable-dev-shm-usage');
chromeOptions.addArguments('--disable-gpu');
chromeOptions.addArguments('--window-size=1920,1080');

if (process.env.CHROME_BIN) {
  chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
}

export const driver: WebDriver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build();

