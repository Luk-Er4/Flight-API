import mysql from 'mysql2/promise';
import securityInfo from './bringpassword';

const database = mysql.createPool({
  host: securityInfo.endpoint,
  user: "user", // user
  password: securityInfo.password,
  database: securityInfo.database_name,
  timezone: "Z"
});

export default database; 