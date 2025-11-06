import mysql from 'mysql2/promise';

const database = mysql.createPool({
  host: "flightbookingsys.mysql.database.azure.com", // flightbookingsys.mysql.database.azure.com
  user: "user", // user
  password: "Nkcrkenu113!",
  database: "flight_ticket",
  timezone: "Z"
});

export default database; 