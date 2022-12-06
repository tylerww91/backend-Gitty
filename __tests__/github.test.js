const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

jest.mock('../lib/services/github');

//putting this in the global scope makes life easier
const agent = request.agent(app);

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
    //think of this as register and log in, the GET /callback route uses functions to give us what is necessary from github
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
    const loggedIn = await agent.get('/api/v1/github/login');
    expect(loggedIn.status).toBe(302);

    const res = await agent.delete('/api/v1/github');
    expect(res.status).toBe(204);

    const notLoggedIn = await agent.get('/api/v1/github/dashboard');
    expect(notLoggedIn.status).toBe(401);
  });

  it('POST /api/v1/posts should create a new post for a authenticated users', async () => {
    const res = await agent.get('/api/v1/github/callback?code=42');
    expect(res.status).toBe(302);
    const resp = await agent
      .post('/api/v1/posts')
      .send({ title: 'it me', description: 'Tyler', user_id: res.body.id });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      description: expect.any(String),
      id: expect.any(String),
      title: expect.any(String),
      user_id: expect.any(String),
      created_at: expect.any(String),
    });
  });

  it('POST /api/v1/posts should decline user posts above 255 characters', async () => {
    const res = await agent.get('/api/v1/github/callback?code=42');
    expect(res.status).toBe(302);
    const resp = await agent.post('/api/v1/posts').send({
      title: 'Bob',
      description:
        'BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH BLAH!!',
      user_id: res.body.id,
    });
    expect(resp.status).toBe(400, 'TOO LONG');
  });

  it('GET /api/v1/posts should return all posts for all users', async () => {
    const user1 = await agent.get('/api/v1/github/callback?code=42');
    expect(user1.status).toBe(302);
    await agent
      .post('/api/v1/posts')
      .send({ title: 'cool', description: 'cheese', user_id: user1.body.id });
    const user2 = await agent.get('/api/v1/github/callback?code=44');
    expect(user2.status).toBe(302);
    await agent
      .post('/api/v1/posts')
      .send({ title: 'its hot', description: 'salsa', user_id: user2.body.id });
    const res = await agent.get('/api/v1/posts');
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "created_at": "2022-12-06T23:26:05.077Z",
          "description": "salsa",
          "id": "2",
          "title": "its hot",
          "user_id": "1",
        },
        Object {
          "created_at": "2022-12-06T23:26:05.065Z",
          "description": "cheese",
          "id": "1",
          "title": "cool",
          "user_id": "1",
        },
      ]
    `);
  });
});
