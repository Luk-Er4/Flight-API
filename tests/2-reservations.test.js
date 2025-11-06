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
  airplaneseatys  ("TE202502261507202502271807", "15A", "Y", "F")
                  ("TE202502261507202502271807", "15B", "N", "F")
                  ("TE202502261507202502271807", "16A", "Y", "Y")
                  ("TE202502261507202502271807", "16B", "Y", "Y")
                  ("TE202502261507202502271807", "17A", "Y", "J")
                  ("TE202502261507202502271807", "17B", "Y", "J")
*/

describe('Reservation Testing..', () => {
  // Choose Seats (2)
  describe('GET /api/FindFlights/:flightid/seat/', () => {
    it('should return 200 and give a flight seats in TE202502261507202502271807', async () => {
      const response = await request(app)
      .get('/api/FindFlights/TE202502261507202502271807/seat/')
      .expect(200);

      expect(response.body).toEqual([{"seatNo":"15A","class":"F","seatID":"TE20250226150720250227180715A"},
                                    {"seatNo":"17A","class":"J","seatID":"TE20250226150720250227180717A"},
                                    {"seatNo":"17B","class":"J","seatID":"TE20250226150720250227180717B"},
                                    {"seatNo":"16A","class":"Y","seatID":"TE20250226150720250227180716A"},
                                    {"seatNo":"16B","class":"Y","seatID":"TE20250226150720250227180716B"}]);
    });
  });

  // Show Overall Info (3)
  describe('GET /api/FindFlights/:flightid/:seatid/overall/', () => {
    it('should return 200 and show all info about flight seat 16A in flight TE202502261507202502271807', async () => {
      const response = await request(app)
      .get('/api/FindFlights/TE202502261507202502271807/TE20250226150720250227180717A/overall/')
      .expect(200);

      expect(response.body).toEqual({"Seat No.":"17A","Class":"J","Departure Time":"2025-02-26T15:07:06.000Z","Arrival Time":"2025-02-27T18:07:55.000Z","Flight No.":"TE1234","Airline":"Testing Airline","Duration":"27:00:49"});
    });
  });

  // Take Selected Seat & Get Reservation No (4)
  describe('PUT /api/FindFlights/:flightid/:seatid/:clientid/', () => {
    it('should return 200, say "seat is yours"', async () => {
      const response = await request(app)
      .put('/api/FindFlights/TE202502261507202502271807/TE20250226150720250227180717A/Ctest/')
      .expect(200);

      expect(response.body).toEqual({"message":"Seat is yours. Your reservation id is TE20250226150720250227180717ACtest"});
    });
  });

  // Check Seats Updated (4+)
  describe('GET /api/FindFlights/:flightid/seat/', () => {
    it('should return 200 and give a flight seats in TE202502261507202502271807', async () => {
      const response = await request(app)
      .get('/api/FindFlights/TE202502261507202502271807/seat/')
      .expect(200);

      expect(response.body).toEqual([{"seatNo":"15A","class":"F","seatID":"TE20250226150720250227180715A"},
                                    {"seatNo":"17B","class":"J","seatID":"TE20250226150720250227180717B"},
                                    {"seatNo":"16A","class":"Y","seatID":"TE20250226150720250227180716A"},
                                    {"seatNo":"16B","class":"Y","seatID":"TE20250226150720250227180716B"}]);
    });
  });

  // Check the Client's Reservation Lists (5)
  describe('GET /api/MyReservation/:clientid/', () => {
    it('should return 200, give booking infos', async () => {
      const response = await request(app)
      .get('/api/MyReservation/Ctest/')
      .expect(200)

      expect(response.body).toEqual([{"bookingID":"TE20250226150720250227180717ACtest"}]);
    });
  });

  // Check the Client's Reservation Info (6)
  describe('GET /api/MyReservation/:clientid/:reservationid/', () => {
    it('should return 200, give detailed info of booked flight', async () => {
      const response = await request(app)
      .get('/api/MyReservation/Ctest/TE20250226150720250227180717ACtest/')
      .expect(200)

      expect(response.body).toEqual([{"firstName":"testF","lastname":"testL","fromAirport":"TST","fromCity":"Testcity","toAirport":"T2T","toCity":"Test2city","hostAirline":"TE","AirlineName":"Testing Airline","flightNo":"TE1234","departTime":"2025-02-26T15:07:06.000Z","arriveTime":"2025-02-27T18:07:55.000Z","seatNo":"17A","class":"J","duration":"27:00:49"}]);
    });
  });

  // Cancel Reservation - Make seat availablie again (7-1)
  describe('PUT /api/MyReservation/:flightid/:seatid/', () => {
    it('should return 200, say "Canceling"', async () => {
      const response = await request(app)
      .put('/api/MyReservation/TE202502261507202502271807/TE20250226150720250227180717A/')
      .expect(200);

      expect(response.body).toEqual({ "message": "Canceling..." });
    });
  });

  // Cancel Reservation - delete reservation info (7-2)
  describe('DELETE /api/MyReservation/:reservationid/', () => {
    it('should return 200, say cancelation completed', async () => {
      const response = await request(app)
      .delete('/api/MyReservation/TE20250226150720250227180717ACtest/')
      .expect(200);

      expect(response.body).toEqual({ "message": "Reservation has been canceled" });
    });
  });

  afterAll(async () => {
    await database.end();
  });
});