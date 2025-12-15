import { Given, When, Then, After } from '@cucumber/cucumber';
import axios, { AxiosInstance } from 'axios';
import { expect } from 'chai';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

let client: AxiosInstance;
let context: any = {};

Given('the API base URL is configured', function () {
  client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true
  });
});

When('I create a manufactured component type with name {string}', async function (name: string) {
  const res = await client.post('/api/manufactured-component-types', { name });
  context.createResponse = res;
  if (res.status === 200 || res.status === 201) {
    context.createdType = res.data;
  }
});

Then('the create response status should be 200 or 201', function () {
  expect([200, 201]).to.include(context.createResponse.status);
});

Then('the response should contain an id and name {string}', function (name: string) {
  expect(context.createdType).to.exist;
  expect(context.createdType).to.have.property('id');
  expect(context.createdType).to.have.property('name', name);
});

When('I get the manufactured component type by id', async function () {
  if (!context.createdType) this.skip();
  const res = await client.get(`/api/manufactured-component-types/${context.createdType.id}`);
  context.getResponse = res;
});

Then('the get response status should be 200', function () {
  expect(context.getResponse.status).to.equal(200);
});

Then('the returned name should be {string}', function (expectedName: string) {
  expect(context.getResponse.data).to.have.property('name', expectedName);
});

When('I update the manufactured component type name to {string}', async function (newName: string) {
  if (!context.createdType) this.skip();
  const res = await client.put(`/api/manufactured-component-types/${context.createdType.id}`, { name: newName });
  context.updateResponse = res;
});

Then('the update response status should be 200 or 204', function () {
  expect([200, 204]).to.include(context.updateResponse.status);
});

When('I get the manufactured component type by id again', async function () {
  if (!context.createdType) this.skip();
  const res = await client.get(`/api/manufactured-component-types/${context.createdType.id}`);
  context.getResponse2 = res;
});

Then('the returned name should be {string}', function (expectedName: string) {
  expect(context.getResponse2.data).to.have.property('name', expectedName);
});

When('I delete the manufactured component type', async function () {
  if (!context.createdType) this.skip();
  const res = await client.delete(`/api/manufactured-component-types/${context.createdType.id}`);
  context.deleteResponse = res;
});

Then('the delete response status should be 200 or 204', function () {
  expect([200, 204]).to.include(context.deleteResponse.status);
});

When('I get the manufactured component type by id after deletion', async function () {
  if (!context.createdType) this.skip();
  const res = await client.get(`/api/manufactured-component-types/${context.createdType.id}`);
  context.getAfterDeleteResponse = res;
});

Then('the get response should not be 200', function () {
  expect(context.getAfterDeleteResponse.status).to.not.equal(200);
});

After(async function () {
  if (context.createdType && context.createdType.id) {
    await client.delete(`/api/manufactured-component-types/${context.createdType.id}`);
  }
  context = {};
});
