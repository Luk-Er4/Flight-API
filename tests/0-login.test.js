import request from 'supertest';
import app from '../app.js';
import database from '../db.js';

/*
  [Test Sample Data]
  customer ("testF", "testL", "TEST1234"), Ctest
*/

// Welcome Page
describe('Login Testing..', () => {
  describe('GET /', () => {
    it('should return 200 OK and show "Hi"', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({ message: "Hi" });
    });
  });

  // Login Page 
  describe('GET /api/login/', () => {
    it('should return 200 OK and show "type informations"', async () => {
      const response = await request(app)
        .get('/api/login/')
        .expect(200);

      expect(response.body).toEqual({ message: "type your first, last name, and passport number" });
    });
  });

  // Verify Identity - 1
  describe('[correct info] GET /api/login/check/', () => {
    it('should return 200 OK and show "welcome" and client ID', async () => {
      const response = await request(app)
        .get('/api/login/check/?first=testF&last=testL&passport=TEST1234') // no / at last
        .expect(200);

      expect(response.body).toEqual({ message: "Welcome! testF! Your client id is Ctest"});
    });
  });

  // Verify Identity - 2
  describe('[wrong info] GET /api/login/check/', () => {
    it('should return 200 and show "Wrong Info"', async () => {
      const response = await request(app)
        .get('/api/login/check/?first=testL&last=testL&passport=TEST9999') // no / at last
        .expect(200);

      expect(response.body).toEqual({ message: "Wrong Info"});
    });
  });

  afterAll(async () => {
    await database.end();
  });
});