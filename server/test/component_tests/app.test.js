const request = require('supertest');
const app = require('../../app');

describe('Test App General Endpoints', () => {
  it("response 200 to index '/' request", async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('response 200 to alive', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
