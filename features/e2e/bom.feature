@e2e
Feature: Bill of Materials (BOM) E2E behaviours

  Background:
    Given the application dev server is running
    And I am on the Bill of Materials page

  Scenario: Page loads and displays BOM table with data
    Then the BOM table should be visible
    And the table should have column headers (Pozíció, Név, Mennyiség, etc.)
    And the table should display BOM items with data

  Scenario: View BOM items with correct data structure
    Then the table should have at least one data row
    And each row should have a position number
    And each row should have a non-empty name
    And each row should display the item type (Nyersanyag or Gyártott komponens)

  Scenario: Open add BOM item dialog
    When I click the "Új tétel hozzáadása" button
    Then the add BOM item dialog should be visible
    And the dialog should have the title "Új BOM tétel hozzáadása"

  Scenario: Add BOM item dialog displays all form fields
    When I open the add BOM item dialog
    Then the type selector should be visible
    And the name input field should be visible
    And the quantity input field should be visible
    And the unit selector should be visible

  Scenario: Dimension fields appear for raw materials
    When I open the add BOM item dialog
    And I select "Nyersanyag" as the type
    Then the length input field should be visible
    And the width input field should be visible
    And the height input field should be visible
    And the material type input field should be visible

  Scenario: Form validation works correctly
    When I open the add BOM item dialog
    Then the submit button should be disabled (form invalid)
    When I fill in the name field
    And I fill in the quantity field
    And I select a unit
    Then the submit button should be enabled (form valid)

  Scenario: Add a new manufactured component BOM item
    Given the BOM table has a certain number of rows
    When I open the add BOM item dialog
    And I select "Gyártott komponens" as the type
    And I enter "Test Kilincs" as the name
    And I enter "2" as the quantity
    And I select "Darab" as the unit
    And I submit the form
    Then a new row should be added to the BOM table
    And the row count should increase by one

  Scenario: Add a new raw material BOM item with dimensions
    Given the BOM table has a certain number of rows
    When I open the add BOM item dialog
    And I select "Nyersanyag" as the type
    And I enter "Test Fenyőfa Deszka" as the name
    And I enter "Fenyőfa" as the material type
    And I enter dimensions: length=800, width=200, height=50
    And I enter "4" as the quantity
    And I select "Darab" as the unit
    And I submit the form
    Then a new row should be added to the BOM table
    And the row count should increase by one

  Scenario: Cancel adding a BOM item
    Given the BOM table has a certain number of rows
    When I open the add BOM item dialog
    And I enter some data in the form
    And I click the cancel button
    Then the dialog should close
    And no new row should be added to the BOM table
    And the row count should remain the same

  Scenario: BOM table displays correct column data
    Then the table should have columns for:
      | Pozíció |
      | Típus   |
      | Név     |
      | Mennyiség |
      | Egység  |
    And each row should have valid data in these columns

