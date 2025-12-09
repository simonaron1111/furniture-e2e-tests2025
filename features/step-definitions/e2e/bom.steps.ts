import { BeforeAll, AfterAll, Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import assert from 'assert';
import { Builder, By, until, WebDriver, Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';

setDefaultTimeout(30_000);

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

let initialRowCount = 0;
const BOM_URL = 'http://localhost:4200/bill';

Given('I am on the Bill of Materials page', async function () {
  assert(driver);
  await driver.get(BOM_URL);
  await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20_000);
});

Then('the BOM table should be visible', async function () {
  assert(driver);
  const table = await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20_000);
  assert.strictEqual(await table.isDisplayed(), true);
});

Then('the table should have column headers \\(Pozíció, Név, Mennyiség, etc.)', async function () {
  assert(driver);
  const headers = await driver.findElements(By.css('th[mat-header-cell]'));
  assert.ok(headers.length > 0, 'Table should have headers');
  const headerTexts = await Promise.all(headers.map(h => h.getText()));
  assert.ok(headerTexts.includes('Pozíció'), 'Header "Pozíció" should be present');
  assert.ok(headerTexts.includes('Név'), 'Header "Név" should be present');
  assert.ok(headerTexts.includes('Mennyiség'), 'Header "Mennyiség" should be present');
});

Then('the table should display BOM items with data', async function () {
  assert(driver);
  await driver.wait(until.elementLocated(By.css('tr[mat-row]')), 10_000);
  const rows = await driver.findElements(By.css('tr[mat-row]'));
  assert.ok(rows.length > 0, 'Table should have data rows');
});

Then('the table should have at least one data row', async function () {
  assert(driver);
  await driver.wait(until.elementLocated(By.css('tr[mat-row]')), 10_000);
  const rows = await driver.findElements(By.css('tr[mat-row]'));
  assert.ok(rows.length > 0, 'Table should have at least one data row');
});

Then('each row should have a position number', async function () {
  assert(driver);
  const rows = await driver.findElements(By.css('tr[mat-row]'));
  assert.ok(rows.length > 0, 'Should have rows');
  const firstRowCells = await rows[0].findElements(By.css('td[mat-cell]'));
  assert.ok(firstRowCells.length > 0, 'First row should have cells');
  const positionText = await firstRowCells[0].getText();
  assert.ok(/^\d+$/.test(positionText.trim()), 'Position should be a number');
});

Then('each row should have a non-empty name', async function () {
  assert(driver);
  const rows = await driver.findElements(By.css('tr[mat-row]'));
  assert.ok(rows.length > 0, 'Should have rows');
  const firstRowCells = await rows[0].findElements(By.css('td[mat-cell]'));
  if (firstRowCells.length > 2) {
    const nameText = await firstRowCells[2].getText();
    assert.ok(nameText.trim().length > 0, 'Name should not be empty');
  }
});

Then('each row should display the item type \\(Nyersanyag or Gyártott komponens\\)', async function () {
  assert(driver);
  const rows = await driver.findElements(By.css('tr[mat-row]'));
  assert.ok(rows.length > 0, 'Should have rows');
  const firstRowCells = await rows[0].findElements(By.css('td[mat-cell]'));
  if (firstRowCells.length > 1) {
    const typeText = await firstRowCells[1].getText();
    assert.ok(typeText.trim() === 'Nyersanyag' || typeText.trim() === 'Gyártott komponens', 
      'Type should be Nyersanyag or Gyártott komponens');
  }
});

When('I click the {string} button', async function (buttonText: string) {
  assert(driver);
  const button = await driver.wait(
    until.elementLocated(By.xpath(`//button[contains(., '${buttonText}')]`)),
    10_000
  );
  await button.click();
});

Then('the add BOM item dialog should be visible', async function () {
  assert(driver);
  const dialog = await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5_000);
  assert.strictEqual(await dialog.isDisplayed(), true);
});

Then('the dialog should have the title {string}', async function (title: string) {
  assert(driver);
  const dialogTitle = await driver.findElement(By.css('h2[mat-dialog-title]'));
  const titleText = await dialogTitle.getText();
  assert.ok(titleText.includes(title), `Dialog title should include "${title}"`);
});

When('I open the add BOM item dialog', async function () {
  assert(driver);
  await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20_000);
  const addButton = await driver.wait(
    until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
    10_000
  );
  await addButton.click();
  await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5_000);
});

Then('the type selector should be visible', async function () {
  assert(driver);
  const typeField = await driver.wait(
    until.elementLocated(By.css('mat-select[formControlName="type"]')),
    5_000
  );
  assert.strictEqual(await typeField.isDisplayed(), true);
});

Then('the name input field should be visible', async function () {
  assert(driver);
  const nameField = await driver.wait(
    until.elementLocated(By.css('input[formControlName="name"]')),
    5_000
  );
  assert.strictEqual(await nameField.isDisplayed(), true);
});

Then('the quantity input field should be visible', async function () {
  assert(driver);
  const quantityField = await driver.wait(
    until.elementLocated(By.css('input[formControlName="quantity"]')),
    5_000
  );
  assert.strictEqual(await quantityField.isDisplayed(), true);
});

Then('the unit selector should be visible', async function () {
  assert(driver);
  const unitField = await driver.wait(
    until.elementLocated(By.css('mat-select[formControlName="unit"]')),
    5_000
  );
  assert.strictEqual(await unitField.isDisplayed(), true);
});

When('I select {string} as the type', async function (type: string) {
  assert(driver);
  const typeSelect = await driver.findElement(By.css('mat-select[formControlName="type"]'));
  await typeSelect.click();
  await driver.sleep(500);
  const option = await driver.wait(
    until.elementLocated(By.xpath(`//mat-option[contains(., '${type}')]`)),
    5_000
  );
  await option.click();
  await driver.sleep(500);
});

Then('the length input field should be visible', async function () {
  assert(driver);
  const lengthField = await driver.wait(
    until.elementLocated(By.css('input[formControlName="length"]')),
    5_000
  );
  assert.strictEqual(await lengthField.isDisplayed(), true);
});

Then('the width input field should be visible', async function () {
  assert(driver);
  const widthField = await driver.findElement(By.css('input[formControlName="width"]'));
  assert.strictEqual(await widthField.isDisplayed(), true);
});

Then('the height input field should be visible', async function () {
  assert(driver);
  const heightField = await driver.findElement(By.css('input[formControlName="height"]'));
  assert.strictEqual(await heightField.isDisplayed(), true);
});

Then('the material type input field should be visible', async function () {
  assert(driver);
  const materialTypeField = await driver.wait(
    until.elementLocated(By.css('input[formControlName="material_type"]')),
    5_000
  );
  assert.strictEqual(await materialTypeField.isDisplayed(), true);
});

Then('the submit button should be disabled \\(form invalid\\)', async function () {
  assert(driver);
  const submitButton = await driver.findElement(
    By.xpath("//button[contains(., 'Hozzáadás')]")
  );
  const isDisabled = await submitButton.getAttribute('disabled');
  assert.ok(isDisabled !== null, 'Submit button should be disabled when form is invalid');
});

When('I fill in the name field', async function () {
  assert(driver);
  const nameField = await driver.findElement(By.css('input[formControlName="name"]'));
  await nameField.clear();
  await nameField.sendKeys('Test Item');
});

When('I fill in the quantity field', async function () {
  assert(driver);
  const quantityField = await driver.findElement(By.css('input[formControlName="quantity"]'));
  await quantityField.clear();
  await quantityField.sendKeys('5');
});

When('I select a unit', async function () {
  assert(driver);
  const unitSelect = await driver.findElement(By.css('mat-select[formControlName="unit"]'));
  await unitSelect.click();
  await driver.sleep(500);
  const unitOption = await driver.wait(
    until.elementLocated(By.xpath("//mat-option[contains(., 'Darab')]")),
    5_000
  );
  await unitOption.click();
  await driver.sleep(500);
});

Then('the submit button should be enabled \\(form valid\\)', async function () {
  assert(driver);
  await driver.sleep(500);
  const submitButton = await driver.findElement(
    By.xpath("//button[contains(., 'Hozzáadás')]")
  );
  const isDisabled = await submitButton.getAttribute('disabled');
  assert.strictEqual(isDisabled, null, 'Submit button should be enabled when form is valid');
});

Given('the BOM table has a certain number of rows', async function () {
  assert(driver);
  await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20_000);
  const rows = await driver.findElements(By.css('tr[mat-row]'));
  initialRowCount = rows.length;
});

When('I enter {string} as the name', async function (name: string) {
  assert(driver);
  const nameField = await driver.findElement(By.css('input[formControlName="name"]'));
  await nameField.clear();
  await nameField.sendKeys(name);
});

When('I enter {string} as the quantity', async function (quantity: string) {
  assert(driver);
  const quantityField = await driver.findElement(By.css('input[formControlName="quantity"]'));
  await quantityField.clear();
  await quantityField.sendKeys(quantity);
});

When('I select {string} as the unit', async function (unit: string) {
  assert(driver);
  const unitSelect = await driver.findElement(By.css('mat-select[formControlName="unit"]'));
  await unitSelect.click();
  await driver.sleep(500);
  const unitOption = await driver.wait(
    until.elementLocated(By.xpath(`//mat-option[contains(., '${unit}')]`)),
    5_000
  );
  await unitOption.click();
  await driver.sleep(500);
});

When('I submit the form', async function () {
  assert(driver);
  const submitButton = await driver.findElement(
    By.xpath("//button[contains(., 'Hozzáadás')]")
  );
  await submitButton.click();
  await driver.sleep(2_000);
});

Then('a new row should be added to the BOM table', async function () {
  assert(driver);
  await driver.sleep(1_000);
  const newRows = await driver.findElements(By.css('tr[mat-row]'));
  assert.ok(newRows.length > initialRowCount, 'New row should be added');
});

Then('the row count should increase by one', async function () {
  assert(driver);
  const newRows = await driver.findElements(By.css('tr[mat-row]'));
  assert.strictEqual(newRows.length, initialRowCount + 1, 'Row count should increase by one');
});

When('I enter {string} as the material type', async function (materialType: string) {
  assert(driver);
  const materialTypeField = await driver.wait(
    until.elementLocated(By.css('input[formControlName="material_type"]')),
    5_000
  );
  await materialTypeField.clear();
  await materialTypeField.sendKeys(materialType);
});

When('I enter dimensions: length={int}, width={int}, height={int}', async function (length: number, width: number, height: number) {
  assert(driver);
  const lengthField = await driver.findElement(By.css('input[formControlName="length"]'));
  await lengthField.clear();
  await lengthField.sendKeys(length.toString());

  const widthField = await driver.findElement(By.css('input[formControlName="width"]'));
  await widthField.clear();
  await widthField.sendKeys(width.toString());

  const heightField = await driver.findElement(By.css('input[formControlName="height"]'));
  await heightField.clear();
  await heightField.sendKeys(height.toString());
});

When('I enter some data in the form', async function () {
  assert(driver);
  const nameField = await driver.findElement(By.css('input[formControlName="name"]'));
  await nameField.clear();
  await nameField.sendKeys('Test Item');
});

When('I click the cancel button', async function () {
  assert(driver);
  const cancelButton = await driver.findElement(
    By.xpath("//button[contains(., 'Mégse')]")
  );
  await cancelButton.click();
  await driver.sleep(1_000);
});

Then('the dialog should close', async function () {
  assert(driver);
  await driver.sleep(1_000);
  const dialogs = await driver.findElements(By.css('mat-dialog-container'));
  assert.strictEqual(dialogs.length, 0, 'Dialog should be closed');
});

Then('no new row should be added to the BOM table', async function () {
  assert(driver);
  const finalRows = await driver.findElements(By.css('tr[mat-row]'));
  assert.strictEqual(finalRows.length, initialRowCount, 'No new row should be added when cancelled');
});

Then('the row count should remain the same', async function () {
  assert(driver);
  const finalRows = await driver.findElements(By.css('tr[mat-row]'));
  assert.strictEqual(finalRows.length, initialRowCount, 'Row count should remain the same');
});

Then('the table should have columns for:', async function (dataTable: any) {
  assert(driver);
  const headers = await driver.findElements(By.css('th[mat-header-cell]'));
  const headerTexts = await Promise.all(headers.map(h => h.getText()));
  const expectedColumns = dataTable.raw().map((row: string[]) => row[0]);
  for (const expected of expectedColumns) {
    assert.ok(headerTexts.includes(expected), `Column "${expected}" should be present`);
  }
});

Then('each row should have valid data in these columns', async function () {
  assert(driver);
  await driver.wait(until.elementLocated(By.css('tr[mat-row]')), 10_000);
  const rows = await driver.findElements(By.css('tr[mat-row]'));
  assert.ok(rows.length > 0, 'Should have rows');
  const firstRowCells = await rows[0].findElements(By.css('td[mat-cell]'));
  assert.ok(firstRowCells.length >= 5, 'Should have at least 5 columns');
  const positionText = await firstRowCells[0].getText();
  assert.ok(/^\d+$/.test(positionText.trim()), 'Position should be a number');
});

