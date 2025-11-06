import request from 'supertest';
import app from '../app.js';
import database from '../db.js';

/*
  [Test Sample Data]
  customer ("testF", "testL", "TEST1234"), Ctest
  country  ("Testcountry",  "TT", 800000, 1000, "open")
           ("Testcountry2", "T2", 100000, 1000, "open")
           ("Testcountry3", "T3", 800000, 1000, "open")
  airport  ("Test Airport",  "Testcity",  "TST", "TT")
           ("Test2 Airport", "Test2city", "T2T", "T2")
           ("Test3 Airport", "Test3city", "T3T", "T3")
  airline  ("Testing Airline", "TE", "TES")
  flightschedule  ('TST','T2T','TE','TE1234','2025-02-26 15:07:06','2025-02-27 18:07:55')
                  ('TST','T3T','TE','TE2345','2025-03-01 00:06:00','2025-03-01 18:03:30')
                  ('T3T','T2T','TE','TE3456','2025-01-02 17:23:40','2025-01-03 05:17:00')
*/

describe('Flight Search Testing..', () => {
  // Get Airport Lists
  describe('GET /api/FindAirport/', () => {
    it('should return 200', async () => {
      const response = await request(app)
      .get('/api/FindAirport')
      .expect(200);
    });
  });

  // Find Airpots by Countrycode
  describe('GET /api/FindAirport/TT/', () => {
    it('should return 200 and give TST with relevant information', async () => {
      const response = await request(app)
      .get('/api/FindAirport/TT/')
      .expect(200);

      expect(response.body).toEqual([{ "AirportName":"Test Airport","LocatedCity":"Testcity","AirportCode":"TST","CountryCode":"TT" }]);
    });
  });

  // Search and Choose Flight (1-1)
  describe('[filter: from and to] GET /api/FindFlights/', () => {
    it('should return 200 and give a flight info from T3T to T2T', async () => {
      const response = await request(app)
      .get('/api/FindFlights/?from=T3T&to=T2T')
      .expect(200);

      expect(response.body).toEqual([{"fromAirport":"T3T","toAirport":"T2T","hostAirline":"TE","flightNo":"TE3456","departTime":"2025-01-02T17:23:40.000Z","arriveTime":"2025-01-03T05:17:00.000Z","FlightID":"TE202501021723202501030517"}]);
    });
  });

  // Search and Choose Flight (1-2)
  describe('[filter: only from] GET /api/FindFlights/', () => {
    it('should return 200 and give a flight info from T3T to T2T', async () => {
      const response = await request(app)
      .get('/api/FindFlights/?from=TST&to=')
      .expect(200);

      expect(response.body).toEqual([{"fromAirport":"TST","toAirport":"T2T","hostAirline":"TE","flightNo":"TE1234","departTime":"2025-02-26T15:07:06.000Z","arriveTime":"2025-02-27T18:07:55.000Z","FlightID":"TE202502261507202502271807"},
                                    {"fromAirport":"TST","toAirport":"T3T","hostAirline":"TE","flightNo":"TE2345","departTime":"2025-03-01T00:06:00.000Z","arriveTime":"2025-03-01T18:03:30.000Z","FlightID":"TE202503010006202503011803"}]);
    });
  });

  // Search and Choose Flight (1-3)
  describe('[filter: only to] GET /api/FindFlights/', () => {
    it('should return 200 and give a flight info from T3T to T2T', async () => {
      const response = await request(app)
      .get('/api/FindFlights/?from=&to=T2T')
      .expect(200);

      expect(response.body).toEqual([{"fromAirport":"T3T","toAirport":"T2T","hostAirline":"TE","flightNo":"TE3456","departTime":"2025-01-02T17:23:40.000Z","arriveTime":"2025-01-03T05:17:00.000Z","FlightID":"TE202501021723202501030517"},
                                    {"fromAirport":"TST","toAirport":"T2T","hostAirline":"TE","flightNo":"TE1234","departTime":"2025-02-26T15:07:06.000Z","arriveTime":"2025-02-27T18:07:55.000Z","FlightID":"TE202502261507202502271807"}]);
    });
  });

  afterAll(async () => {
    await database.end();
  });
});