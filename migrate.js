import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to Aiven PostgreSQL');

    const dbDir = path.join(__dirname, 'database');
    const files = fs.readdirSync(dbDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

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
