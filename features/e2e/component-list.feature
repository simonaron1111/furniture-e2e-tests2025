@e2e
Feature: Component List Integration E2E behaviours

  Background:
    Given the application dev server is running
    And I am on the Bill of Materials page

  Scenario: BOM table loads data from backend component lists
    Then the BOM table should be visible
    And the table should display BOM items fetched from the backend
    And the BOM items should have valid data structure

  Scenario: BOM table shows raw materials from component list
    Then the BOM table should be visible
    And I wait for the table to load data
    Then the table should have at least one data row
    And each row should display raw material information
    And raw material rows should show dimensions when available

  Scenario: BOM data is refreshed from backend
    Given the BOM table has loaded initial data
    When I wait for backend data to load
    Then the BOM table should display updated data
    And the data should match the backend component list structure

  Scenario: BOM table displays component list information correctly
    Then the BOM table should be visible
    And I wait for the table to load data
    Then each row should have a position number
    And each row should have a non-empty name
    And each row should display the item type (Nyersanyag or Gyártott komponens)
    And raw material rows should have material type information

