/* Selenium + Mocha E2E tests for Bill of Materials (BOM) */
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

const BASE_URL = 'http://localhost:4200/bill';

describe('Bill of Materials E2E', function () {
  this.timeout(90000);

  /** @type {import('selenium-webdriver').ThenableWebDriver} */
  let driver;

  before(async () => {
    const options = new chrome.Options()
      .addArguments('--headless=new', '--window-size=1280,900', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage');

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

  it('loads the BOM page and displays the table with data', async () => {
    await driver.get(BASE_URL);

    // Wait for the table to be present
    const table = await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    await driver.wait(until.elementIsVisible(table), 20000);

    // Verify table headers are present
    const headers = await driver.findElements(By.css('th[mat-header-cell]'));
    expect(headers.length, 'Table should have headers').to.be.greaterThan(0);

    // Verify expected column headers
    const headerTexts = await Promise.all(headers.map(h => h.getText()));
    expect(headerTexts).to.include('Pozíció');
    expect(headerTexts).to.include('Név');
    expect(headerTexts).to.include('Mennyiség');

    // Wait for data rows to load (mock data should appear)
    const rows = await driver.wait(
      until.elementsLocated(By.css('tr[mat-row]')),
      10000
    );
    expect(rows.length, 'Table should have data rows').to.be.greaterThan(0);
  });

  it('displays BOM items with correct data structure', async () => {
    await driver.get(BASE_URL);

    // Wait for table and data
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const rows = await driver.wait(
      until.elementsLocated(By.css('tr[mat-row]')),
      10000
    );

    // Verify at least one row has data
    expect(rows.length).to.be.greaterThan(0);

    // Check first row has cells with content
    const firstRowCells = await rows[0].findElements(By.css('td[mat-cell]'));
    expect(firstRowCells.length).to.be.greaterThan(0);

    // Verify position column has a number
    const positionCell = firstRowCells[0];
    const positionText = await positionCell.getText();
    expect(positionText.trim(), 'Position should be a number').to.match(/^\d+$/);

    // Verify name column has text
    if (firstRowCells.length > 2) {
      const nameCell = firstRowCells[2]; // Name is typically 3rd column (after position and type)
      const nameText = await nameCell.getText();
      expect(nameText.trim().length, 'Name should not be empty').to.be.greaterThan(0);
    }
  });

  it('can open the add BOM item dialog', async () => {
    await driver.get(BASE_URL);

    // Wait for page to load
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);

    // Find and click the "Add" button
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
      10000
    );
    await addButton.click();

    // Wait for dialog to appear
    const dialog = await driver.wait(
      until.elementLocated(By.css('mat-dialog-container')),
      5000
    );
    expect(await dialog.isDisplayed()).to.equal(true);

    // Verify dialog title
    const dialogTitle = await driver.findElement(By.css('h2[mat-dialog-title]'));
    const titleText = await dialogTitle.getText();
    expect(titleText).to.include('Új BOM tétel hozzáadása');
  });

  it('displays form fields in the add BOM item dialog', async () => {
    await driver.get(BASE_URL);

    // Wait for page and open dialog
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
      10000
    );
    await addButton.click();

    // Wait for dialog
    await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5000);

    // Verify form fields are present
    const typeField = await driver.wait(
      until.elementLocated(By.css('mat-select[formControlName="type"]')),
      5000
    );
    expect(await typeField.isDisplayed()).to.equal(true);

    const nameField = await driver.wait(
      until.elementLocated(By.css('input[formControlName="name"]')),
      5000
    );
    expect(await nameField.isDisplayed()).to.equal(true);

    const quantityField = await driver.wait(
      until.elementLocated(By.css('input[formControlName="quantity"]')),
      5000
    );
    expect(await quantityField.isDisplayed()).to.equal(true);

    const unitField = await driver.wait(
      until.elementLocated(By.css('mat-select[formControlName="unit"]')),
      5000
    );
    expect(await unitField.isDisplayed()).to.equal(true);
  });

  it('shows dimension fields when raw material type is selected', async () => {
    await driver.get(BASE_URL);

    // Open dialog
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
      10000
    );
    await addButton.click();
    await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5000);

    // Select raw material type
    const typeSelect = await driver.findElement(By.css('mat-select[formControlName="type"]'));
    await typeSelect.click();
    await driver.sleep(500); // Wait for dropdown to open

    // Click on raw material option
    const rawMaterialOption = await driver.wait(
      until.elementLocated(By.xpath("//mat-option[contains(., 'Nyersanyag')]")),
      5000
    );
    await rawMaterialOption.click();
    await driver.sleep(500); // Wait for selection to apply

    // Verify dimension fields appear
    const lengthField = await driver.wait(
      until.elementLocated(By.css('input[formControlName="length"]')),
      5000
    );
    expect(await lengthField.isDisplayed()).to.equal(true);

    const widthField = await driver.findElement(By.css('input[formControlName="width"]'));
    expect(await widthField.isDisplayed()).to.equal(true);

    const heightField = await driver.findElement(By.css('input[formControlName="height"]'));
    expect(await heightField.isDisplayed()).to.equal(true);
  });

  it('validates required fields in the add BOM item dialog', async () => {
    await driver.get(BASE_URL);

    // Open dialog
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
      10000
    );
    await addButton.click();
    await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5000);

    // Submit button should be disabled initially (form invalid)
    const submitButton = await driver.findElement(
      By.xpath("//button[contains(., 'Hozzáadás')]")
    );
    const isDisabled = await submitButton.getAttribute('disabled');
    expect(isDisabled, 'Submit button should be disabled when form is invalid').to.not.be.null;

    // Fill in required fields
    const nameField = await driver.findElement(By.css('input[formControlName="name"]'));
    await nameField.clear();
    await nameField.sendKeys('Test Item');

    const quantityField = await driver.findElement(By.css('input[formControlName="quantity"]'));
    await quantityField.clear();
    await quantityField.sendKeys('5');

    // Select unit
    const unitSelect = await driver.findElement(By.css('mat-select[formControlName="unit"]'));
    await unitSelect.click();
    await driver.sleep(500);
    const unitOption = await driver.wait(
      until.elementLocated(By.xpath("//mat-option[contains(., 'Darab')]")),
      5000
    );
    await unitOption.click();
    await driver.sleep(500);

    // Submit button should now be enabled
    await driver.sleep(500); // Wait for form validation
    const isDisabledAfter = await submitButton.getAttribute('disabled');
    expect(isDisabledAfter, 'Submit button should be enabled when form is valid').to.be.null;
  });

  it('can add a new manufactured component BOM item', async () => {
    await driver.get(BASE_URL);

    // Get initial row count
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const initialRows = await driver.findElements(By.css('tr[mat-row]'));
    const initialCount = initialRows.length;

    // Open dialog
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
      10000
    );
    await addButton.click();
    await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5000);

    // Select manufactured component type
    const typeSelect = await driver.findElement(By.css('mat-select[formControlName="type"]'));
    await typeSelect.click();
    await driver.sleep(500);
    const manufacturedOption = await driver.wait(
      until.elementLocated(By.xpath("//mat-option[contains(., 'Gyártott komponens')]")),
      5000
    );
    await manufacturedOption.click();
    await driver.sleep(500);

    // Fill in form
    const nameField = await driver.findElement(By.css('input[formControlName="name"]'));
    await nameField.clear();
    await nameField.sendKeys('Test Kilincs');

    const quantityField = await driver.findElement(By.css('input[formControlName="quantity"]'));
    await quantityField.clear();
    await quantityField.sendKeys('2');

    // Select unit
    const unitSelect = await driver.findElement(By.css('mat-select[formControlName="unit"]'));
    await unitSelect.click();
    await driver.sleep(500);
    const unitOption = await driver.wait(
      until.elementLocated(By.xpath("//mat-option[contains(., 'Darab')]")),
      5000
    );
    await unitOption.click();
    await driver.sleep(500);

    // Submit form
    const submitButton = await driver.findElement(
      By.xpath("//button[contains(., 'Hozzáadás')]")
    );
    await submitButton.click();

    // Wait for dialog to close
    await driver.wait(
      until.stalenessOf(await driver.findElement(By.css('mat-dialog-container'))),
      10000
    ).catch(() => {
      // Dialog might close quickly, check if it's gone
    });

    // Wait a bit for the item to be added
    await driver.sleep(1000);

    // Verify new row was added
    const newRows = await driver.findElements(By.css('tr[mat-row]'));
    expect(newRows.length, 'New row should be added').to.be.greaterThan(initialCount);
  });

  it('can add a new raw material BOM item with dimensions', async () => {
    await driver.get(BASE_URL);

    // Get initial row count
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const initialRows = await driver.findElements(By.css('tr[mat-row]'));
    const initialCount = initialRows.length;

    // Open dialog
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
      10000
    );
    await addButton.click();
    await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5000);

    // Select raw material type
    const typeSelect = await driver.findElement(By.css('mat-select[formControlName="type"]'));
    await typeSelect.click();
    await driver.sleep(500);
    const rawMaterialOption = await driver.wait(
      until.elementLocated(By.xpath("//mat-option[contains(., 'Nyersanyag')]")),
      5000
    );
    await rawMaterialOption.click();
    await driver.sleep(500);

    // Fill in form
    const nameField = await driver.findElement(By.css('input[formControlName="name"]'));
    await nameField.clear();
    await nameField.sendKeys('Test Fenyőfa Deszka');

    const materialTypeField = await driver.wait(
      until.elementLocated(By.css('input[formControlName="material_type"]')),
      5000
    );
    await materialTypeField.clear();
    await materialTypeField.sendKeys('Fenyőfa');

    // Fill dimensions
    const lengthField = await driver.findElement(By.css('input[formControlName="length"]'));
    await lengthField.clear();
    await lengthField.sendKeys('800');

    const widthField = await driver.findElement(By.css('input[formControlName="width"]'));
    await widthField.clear();
    await widthField.sendKeys('200');

    const heightField = await driver.findElement(By.css('input[formControlName="height"]'));
    await heightField.clear();
    await heightField.sendKeys('50');

    const quantityField = await driver.findElement(By.css('input[formControlName="quantity"]'));
    await quantityField.clear();
    await quantityField.sendKeys('4');

    // Select unit
    const unitSelect = await driver.findElement(By.css('mat-select[formControlName="unit"]'));
    await unitSelect.click();
    await driver.sleep(500);
    const unitOption = await driver.wait(
      until.elementLocated(By.xpath("//mat-option[contains(., 'Darab')]")),
      5000
    );
    await unitOption.click();
    await driver.sleep(500);

    // Submit form
    const submitButton = await driver.findElement(
      By.xpath("//button[contains(., 'Hozzáadás')]")
    );
    await submitButton.click();

    // Wait for dialog to close
    await driver.sleep(2000);

    // Verify new row was added
    const newRows = await driver.findElements(By.css('tr[mat-row]'));
    expect(newRows.length, 'New row should be added').to.be.greaterThan(initialCount);
  });

  it('can cancel adding a BOM item', async () => {
    await driver.get(BASE_URL);

    // Get initial row count
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const initialRows = await driver.findElements(By.css('tr[mat-row]'));
    const initialCount = initialRows.length;

    // Open dialog
    const addButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Új tétel hozzáadása')]")),
      10000
    );
    await addButton.click();
    await driver.wait(until.elementLocated(By.css('mat-dialog-container')), 5000);

    // Fill in some data
    const nameField = await driver.findElement(By.css('input[formControlName="name"]'));
    await nameField.clear();
    await nameField.sendKeys('Test Item');

    // Click cancel
    const cancelButton = await driver.findElement(
      By.xpath("//button[contains(., 'Mégse')]")
    );
    await cancelButton.click();

    // Wait for dialog to close
    await driver.sleep(1000);

    // Verify no new row was added
    const finalRows = await driver.findElements(By.css('tr[mat-row]'));
    expect(finalRows.length, 'No new row should be added when cancelled').to.equal(initialCount);
  });

  it('displays correct column data in the BOM table', async () => {
    await driver.get(BASE_URL);

    // Wait for table and data
    await driver.wait(until.elementLocated(By.css('table[mat-table]')), 20000);
    const rows = await driver.wait(
      until.elementsLocated(By.css('tr[mat-row]')),
      10000
    );

    expect(rows.length).to.be.greaterThan(0);

    // Check first row columns
    const firstRowCells = await rows[0].findElements(By.css('td[mat-cell]'));
    
    // Verify we have expected number of columns (at least 5: position, type, name, quantity, unit)
    expect(firstRowCells.length).to.be.greaterThanOrEqual(5);

    // Verify position is a number
    const positionText = await firstRowCells[0].getText();
    expect(positionText.trim()).to.match(/^\d+$/);

    // Verify type is displayed (Nyersanyag or Gyártott komponens)
    const typeText = await firstRowCells[1].getText();
    expect(typeText.trim()).to.satisfy(
      (text) => text === 'Nyersanyag' || text === 'Gyártott komponens',
      'Type should be Nyersanyag or Gyártott komponens'
    );

    // Verify name is not empty
    const nameText = await firstRowCells[2].getText();
    expect(nameText.trim().length).to.be.greaterThan(0);
  });
});

