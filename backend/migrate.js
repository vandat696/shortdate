import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

// Remove sslmode from connection string if present, we'll handle SSL separately
connectionString = connectionString.replace('?sslmode=require', '');

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Aiven PostgreSQL');

    const dbDir = path.join(__dirname, '..', 'database');
    
    // Run schema.sql first, then other migration files in order
    const allFiles = fs.readdirSync(dbDir).filter(f => f.endsWith('.sql'));
    const schemaFile = allFiles.find(f => f === 'schema.sql');
    const migrationFiles = allFiles.filter(f => f !== 'schema.sql').sort();
    
    const files = schemaFile ? [schemaFile, ...migrationFiles] : migrationFiles;

    console.log(`\n📋 Found ${files.length} migration files:\n`);

    for (const file of files) {
      const filePath = path.join(dbDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        console.log(`⏳ Running: ${file}...`);
        await pool.query(sql);
        console.log(`✅ ${file} completed\n`);
      } catch (err) {
        console.error(`❌ ${file} failed:`, err.message);
        throw err;
      }
    }

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
