@e2e
Feature: ManufacturedComponent CRUD
  Background:
    Given the API base URL is configured

  Scenario: Create, read, update and delete a manufactured component (requires component-list API)
    When I ensure there is a component list available
    And I create a manufactured component of quantity 4 using the available component list and a new type
    Then the create response should be 200 or 201 and contain an id
    When I get the manufactured component by id
    Then I should receive status 200 and the quantity should be 4
    When I update the manufactured component quantity to 7
    Then the update response should be 200 or 204
    When I delete the manufactured component
    Then subsequent GET by id should not return 200