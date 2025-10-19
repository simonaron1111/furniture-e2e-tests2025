@e2e
Feature: Draw2d E2E behaviours

  Background:
    Given the application dev server is running
    And I am on the Draw2d page

  Scenario: Page loads and renders the canvas
    Then the canvas should be visible
    And the canvas drawing surface should be greater than zero
    And the property size panel should be visible

  Scenario: Draw a rectangle, select it to show size inputs, then clear all
    When I draw a rectangle from 50,50 to 200,150 on the canvas
    And I switch to the select tool
    And I click at 125,100 on the canvas
    Then the width and height inputs should be visible
    When I clear all elements in the UI
    Then the width and height inputs should not be present
