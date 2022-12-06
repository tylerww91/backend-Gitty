const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const { agent } = require('supertest');

jest.mock('../lib/services/github');

describe('github auth', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('/api/v1/github/login should redirect to the github oauth page', async () => {
    const res = await request(app).get('/api/v1/github/login');
    expect(res.header.location).toMatch(
      /https:\/\/github.com\/login\/oauth\/authorize\?client_id=[\w\d]+&scope=user&redirect_uri=http:\/\/localhost:7890\/api\/v1\/github\/callback/i
    );
  });

  it('/api/v1/github/callback should login users and redirect to dashboard', async () => {
    const res = await request
      .agent(app)
      .get('/api/v1/github/callback?code=42')
      .redirects(1);
    expect(res.body).toEqual({
      id: expect.any(String),
      login: 'fake_github_user',
      email: 'not-real@example.com',
      avatar: 'https://www.placecage.com/gif/300/300',
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it('DELETE /api/v1/github should logout a user', async () => {
    const loggedIn = await request(app).get('/api/v1/github/login');
    expect(loggedIn.status).toBe(302);

    const res = await agent(app).delete('/api/v1/github');
    expect(res.status).toBe(204);

    const notLoggedIn = await agent(app).get('/api/v1/github/dashboard');
    expect(notLoggedIn.status).toBe(401);
  });

  it('POST /api/v1/posts should create a new post for a authenticated users', async () => {
    const loggedIn = await request(app).get('/api/v1/github/login');
    await agent(app).get('/api/v1/github/callback');
    expect(loggedIn.status).toBe(302);
    console.log(agent);

    const res = await agent(app)
      .post('/api/v1/posts')
      .send({ title: 'it me', description: 'Tyler' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      created_at: expect.any(String),
    });
  });
});
