import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const dbConnection = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default dbConnection;
