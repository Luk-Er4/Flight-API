import mysql from 'mysql2/promise';
import password from './bringpassword';

const database = mysql.createPool({
  host: password.host,
  user: "user", // user
  password: password.password,
  database: password.database_name,
  timezone: "Z"
});

export default database; 