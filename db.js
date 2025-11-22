import mysql from 'mysql2/promise';
import password from './bringpassword';

const database = mysql.createPool({
  host: password.host, // flightbookingsys.mysql.database.azure.com
  user: "user", // user
  password: password.password,
  database: "flight_ticket",
  timezone: "Z"
});

export default database; 