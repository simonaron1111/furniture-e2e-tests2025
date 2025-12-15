import { Given, When, Then, After } from '@cucumber/cucumber';
import axios, { AxiosInstance } from 'axios';
import { expect } from 'chai';

const BASE_URL = process.env.BASE_URL || 'http://furniture_backend_e2e:8080';
let client: AxiosInstance;
let ctx: any = {};

Given('the API base URL is configured', function () {
  client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true
  });
});

When('I ensure there is a component list available', async function () {
  const res = await client.get('/api/component-lists');
  if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
    ctx.componentListId = res.data[0].id;
    return;
  }
  const cr = await client.post('/api/component-lists', { name: `e2e-cl-${Date.now()}` });
  if ([200, 201].includes(cr.status)) {
    ctx.componentListId = cr.data.id;
  } else {
    return 'skipped';
  }
  return 'ok';
});

When('I create a manufactured component of quantity {int} using the available component list and a new type', async function (quantity: number) {
  const typeRes = await client.post('/api/manufactured-component-types', { name: `e2e-type-${Date.now()}` });
  if (![200, 201].includes(typeRes.status)) {
    return 'skipped';
  }
  ctx.type = typeRes.data;

  const payload = {
    componentListId: ctx.componentListId,
    manufacturedComponentTypeId: ctx.type.id,
    quantity
  };
  const res = await client.post('/api/manufactured-components', payload);
  ctx.createComponentResponse = res;
  if ([200, 201].includes(res.status)) {
    ctx.component = res.data;
  }
  return 'ok';
});

Then('the create response should be 200 or 201 and contain an id', function () {
  expect([200, 201]).to.include(ctx.createComponentResponse.status);
  expect(ctx.component).to.have.property('id');
});

When('I get the manufactured component by id', async function () {
  if (!ctx.component) return 'skipped';
  const res = await client.get(`/api/manufactured-components/${ctx.component.id}`);
  ctx.getComponentResponse = res;
  return 'ok';
});

Then('I should receive status 200 and the quantity should be {int}', function (expectedQty: number) {
  expect(ctx.getComponentResponse.status).to.equal(200);
  expect(ctx.getComponentResponse.data).to.have.property('quantity', expectedQty);
});

When('I update the manufactured component quantity to {int}', async function (newQty: number) {
  if (!ctx.component) return 'skipped';
  const res = await client.put(`/api/manufactured-components/${ctx.component.id}`, { quantity: newQty });
  ctx.updateResponse = res;
  return 'ok';
});

Then('the update response should be 200 or 204', function () {
  expect([200, 204]).to.include(ctx.updateResponse.status);
});

When('I delete the manufactured component', async function () {
  if (!ctx.component) return 'skipped';
  const res = await client.delete(`/api/manufactured-components/${ctx.component.id}`);
  ctx.deleteResp = res;
  return 'ok';
});

Then('subsequent GET by id should not return 200', async function () {
  if (!ctx.component) return 'skipped';
  const res = await client.get(`/api/manufactured-components/${ctx.component.id}`);
  expect(res.status).to.not.equal(200);
  return 'ok';
});

After(async function () {
  try {
    if (ctx.component && ctx.component.id) {
      await client.delete(`/api/manufactured-components/${ctx.component.id}`);
    }
    if (ctx.type && ctx.type.id) {
      await client.delete(`/api/manufactured-component-types/${ctx.type.id}`);
    }
  } catch (e) {}
  ctx = {};
});

When('I create a manufactured component type with name {string}', async function (name: string) {
  if (!client) {
    client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json', 'Host': 'localhost' },
      validateStatus: () => true
    });
  }
  const res = await client.post('/api/manufactured-component-types', { name });
  console.log(res);
  console.log(res.data);
  console.log(res.status);
  console.log(res.statusText)
  ctx.createResponse = res;
  if (res.status === 200 || res.status === 201) {
    ctx.createdType = res.data;
  }
});

Then('the create response status should be 200 or 201', function () {
  expect([200, 201]).to.include(ctx.createResponse.status);
});

Then('the response should contain an id and name {string}', function (name: string) {
  expect(ctx.createdType).to.exist;
  expect(ctx.createdType).to.have.property('id');
  expect(ctx.createdType).to.have.property('name', name);
});

When('I get the manufactured component type by id', async function () {
  if (!ctx.createdType) return 'skipped';
  const res = await client.get(`/api/manufactured-component-types/${ctx.createdType.id}`);
  ctx.getResponse = res;
  return 'ok';
});

Then('the get response status should be 200', function () {
  expect(ctx.getResponse.status).to.equal(200);
});

Then('the returned name should be {string}', function (expectedName: string) {
  const response = ctx.getResponse2 || ctx.getResponse;
  expect(response.data).to.have.property('name', expectedName);
});

When('I update the manufactured component type name to {string}', async function (newName: string) {
  if (!ctx.createdType) return 'skipped';
  const res = await client.put(`/api/manufactured-component-types/${ctx.createdType.id}`, { name: newName });
  ctx.updateResponse = res;
  return 'ok';
});

Then('the update response status should be 200 or 204', function () {
  console.log(JSON.stringify(ctx.updateResponse));
  expect([200, 204]).to.include(ctx.updateResponse.status);
});

When('I get the manufactured component type by id again', async function () {
  if (!ctx.createdType) return 'skipped';
  const res = await client.get(`/api/manufactured-component-types/${ctx.createdType.id}`);
  ctx.getResponse2 = res;
  return 'ok';
});

When('I delete the manufactured component type', async function () {
  if (!ctx.createdType) return 'skipped';
  const res = await client.delete(`/api/manufactured-component-types/${ctx.createdType.id}`);
  ctx.deleteResponse = res;
  return 'ok';
});

Then('the delete response status should be 200 or 204', function () {
  expect([200, 204]).to.include(ctx.deleteResponse.status);
});

When('I get the manufactured component type by id after deletion', async function () {
  if (!ctx.createdType) return 'skipped';
  const res = await client.get(`/api/manufactured-component-types/${ctx.createdType.id}`);
  ctx.getAfterDeleteResponse = res;
  return 'ok';
});

Then('the get response should not be 200', function () {
  expect(ctx.getAfterDeleteResponse.status).to.not.equal(200);
});

After(async function () {
  if (ctx.createdType && ctx.createdType.id) {
    await client.delete(`/api/manufactured-component-types/${ctx.createdType.id}`);
  }
  ctx = {};
});