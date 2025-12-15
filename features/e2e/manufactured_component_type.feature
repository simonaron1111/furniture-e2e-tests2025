@e2e
Feature: ManufacturedComponentType CRUD
  As a tester I want to verify the ManufacturedComponentType endpoints for create, read, update and delete
  Background:
    Given the API base URL is configured

  Scenario: Create, read, update and delete a manufactured component type
    When I create a manufactured component type with name "e2e-type-create"
    Then the create response status should be 200 or 201
    And the response should contain an id and name "e2e-type-create"
    When I get the manufactured component type by id
    Then the get response status should be 200
    And the returned name should be "e2e-type-create"
    When I update the manufactured component type name to "e2e-type-updated"
    Then the update response status should be 200 or 204
    When I get the manufactured component type by id again
    Then the returned name should be "e2e-type-updated"
    When I delete the manufactured component type
    Then the delete response status should be 200 or 204
    When I get the manufactured component type by id after deletion
    Then the get response should not be 200