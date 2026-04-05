import pg from 'pg';
const { Pool } = pg;

// Support both DATABASE_URL (production) and individual env vars (development)
let poolConfig;

if (process.env.DATABASE_URL) {
  let connectionString = process.env.DATABASE_URL;
  
  // Remove sslmode from connection string if present
  connectionString = connectionString.replace('?sslmode=require', '');
  
  poolConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'shortdate',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
