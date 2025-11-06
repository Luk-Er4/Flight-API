import express from 'express';
import database from './db.js';

const app = express();
const db = database;

// Welcome Page
app.get('/', (req, res) => {
  res.json({"message": "Hi"});
});

//////////////////////////////////////////////////////////////////////////////////

// Login Page 
app.get('/api/login/', async (req, res) => {
    res.json({"message": "type your first, last name, and passport number"});
});

// Verify Identity
app.get('/api/login/check/', async (req, res) => {
    const first    = req.query.first;
    const last     = req.query.last;
    const passport = req.query.passport;

    try {
        const rows = await db.query(
            "select customerID from customer where firstName = ? and lastName = ? and passportNumber = ?",
            [first, last, passport]
        );

        res.json({"message": "Welcome! " + first + "! Your client id is " + rows[0][0]['customerID']});
    }
    catch {
       res.json({"message": "Wrong Info"}); 
    }
});

//////////////////////////////////////////////////////////////////////////////////

// Get Airport Lists
app.get('/api/FindAirport/', async (req, res) => {
    const rows = await db.query(
        "select * from airport"
    );
    let result = rows[0]
    res.json(result);
});

// Find Airpots by Countrycode
app.get('/api/FindAirport/:id/', async (req, res) => {
    const countryCode = req.params.id;

    const rows = await db.query(
      "select * from airport where CountryCode = ?",
      [countryCode]
    );
    res.json(rows[0]);
});

//////////////////////////////////////////////////////////////////

// Search and Choose Flight (1)
app.get('/api/FindFlights/', async (req, res) => {
    let from = req.query.from;
    let to = req.query.to;

    if (!from && !to){
        const rows = await db.query(
            "select * from flightschedule"
        );
        res.json(rows[0]);
    }
    else if (!from){
        const rows = await db.query(
            "select * from flightschedule where toAirport = ?",
            [to]
        );
        res.json(rows[0]);
    }
    else if (!to){
        const rows = await db.query(
            "select * from flightschedule where fromAirport = ?",
            [from]
        );
        res.json(rows[0]);
    }
    else {
        const rows = await db.query(
            "select * from flightschedule where fromAirport = ? and toAirport = ?",
            [from, to]
        );
        res.json(rows[0]);
    }
});

// Choose Seats (2)
app.get('/api/FindFlights/:flightid/seat/', async (req, res) => {
    const flight = req.params.flightid;
    
    const rows = await db.query(
        "select seatNo, class, seatID from airplaneseats where FlightID = ? and availability = 'Y' order by class",
        [flight]
    );
    res.json(rows[0]);
});

// Show Overall Info (3)
app.get('/api/FindFlights/:flightid/:seatid/overall/', async (req, res) => {
    const flight = req.params.flightid;
    const seat   = req.params.seatid;
    
    // get general info
    const seatRow = await db.query(
        "select seatNo, class from airplaneseats where FlightID = ? and seatID = ?",
        [flight, seat]
    );
    const flightRow = await db.query(
        "select departTime, arriveTime, flightNo from flightschedule where FlightID = ?",
        [flight]
    );
    const airlineRow = await db.query(
        "select AirlineName from airline \
	        where IATA = (select hostAirline from flightschedule where FlightID = ?)",
        [flight]
    );
    // cost variables
    const getTimeInfo = await db.query(
        "select TIMEDIFF(arriveTime, departTime) as estimatedTime from flightschedule where FlightID = ?",
        [flight]
    )

    let seatNo      = seatRow[0][0]["seatNo"];
    let seatClass   = seatRow[0][0]["class"];
    let departTime  = flightRow[0][0]["departTime"];
    let arriveTime  = flightRow[0][0]["arriveTime"];
    let flightNo    = flightRow[0][0]["flightNo"];
    let airline     = airlineRow[0][0]["AirlineName"];
    let flightTime  = getTimeInfo[0][0]["estimatedTime"];

    //estCost = costCalculator(flightTime, flightClass);

    res.json({
        "Seat No.": seatNo, 
        "Class": seatClass,
        "Departure Time": departTime,
        "Arrival Time": arriveTime,
        "Flight No.": flightNo,
        "Airline": airline,
        "Duration": flightTime
    });
});

// Take Selected Seat & Get Reservation No (4)
app.put('/api/FindFlights/:flightid/:seatid/:clientid/', async (req, res) => {
    const flight   = req.params.flightid;
    const seat     = req.params.seatid;
    const clientid = req.params.clientid;
    
    // update seat availiability
    await db.query(
        "update airplaneseats set availability = 'N' where seatID = ? and FlightID = ?",
        [seat, flight]
    );

    await db.query(
        "INSERT INTO bookinginfo (seatInfo, customerID) VALUES (?, ?)",
        [seat, clientid]
    );

    const reservid = await db.query(
        "select bookingID from bookinginfo where customerID = ?",
        [clientid]
    );

    res.json({ "message": "Seat is yours. Your reservation id is " + reservid[0][0]['bookingID'] });
});

// Check the Client's Reservation Lists (5)
app.get('/api/MyReservation/:clientid/', async (req, res) => {
    const clientid = req.params.clientid;

    const reservations = await db.query(
        "select bookingID from bookinginfo where customerID = ?",
        [clientid]
    ); 

    res.json(reservations[0]);
});

// Check the Client's Reservation Info (6)
app.get('/api/MyReservation/:clientid/:reservationid/', async (req, res) => {
    const reservationid = req.params.reservationid;

    const reservationinfo = await db.query(
        "select firstName, lastname, \
	        fromAirport, (select LocatedCity from airport where AirportCode = fromAirport) as fromCity, \
	        toAirport, (select LocatedCity from airport where AirportCode = toAirport) as toCity, \
                    hostAirline, AirlineName, flightNo, departTime, arriveTime, seatNo, class, \
                    TIMEDIFF(arriveTime, departTime) as duration from bookinginfo \
                    \
                left join customer on customer.customerID = bookinginfo.customerID \
                left join airplaneseats on bookinginfo.seatInfo = airplaneseats.seatID \
                left join flightschedule on airplaneseats.FlightID = flightschedule.FlightID \
                left join airline on flightschedule.hostAirline = airline.IATA \
                \
        where bookingID = ?",
        [reservationid]
    ); 

    res.json(reservationinfo[0]);
});

// Cancel Reservation - Make seat availablie again (7-1)
app.put('/api/MyReservation/:flightid/:seatid/', async (req, res) => {
    const flight   = req.params.flightid;
    const seat     = req.params.seatid;
    
    // update seat availiability
    await db.query(
        "update airplaneseats set availability = 'Y' where seatID = ? and FlightID = ?",
        [seat, flight]
    );

    res.json({ "message": "Canceling..." });
});

// Cancel Reservation - delete reservation info (7-2)
app.delete('/api/MyReservation/:reservationid/', async (req, res) => {
    const reservationid = req.params.reservationid;
    
    await db.query(
        "delete from bookinginfo where bookingID = ?",
        [reservationid]
    );

    res.json({ "message": "Reservation has been canceled" });
});


app.listen(80, () => {
        console.log(`Server running on http://localhost:3000`);
    });

export default app;