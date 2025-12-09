import { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import assert from 'assert';
import { Builder, By, until, WebDriver, Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';

setDefaultTimeout(120_000);

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
  
Given('the application dev server is running', function () {
    return 'ok';
});