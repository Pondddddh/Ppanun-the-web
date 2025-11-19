const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

const sql = neon(process.env.NEON_DATABASE_URL);
const schema1 = fs.readFileSync('./src/scripts/create_users_table.sql', 'utf8');
const schema2 = fs.readFileSync('./src/scripts/create_inventory_table.sql', 'utf8');
const schema3 = fs.readFileSync('./src/scripts/create_game_stats.sql', 'utf8');
const schema4 = fs.readFileSync('./src/scripts/create_procedure.sql', 'utf8');
const schema5 = fs.readFileSync('./src/scripts/create_trigger.sql', 'utf8');

const allSchema = [schema1,schema2,schema3,schema4,schema5];

async function setup() {
  try {
    console.log("Connecting to:", process.env.DATABASE_URL);

    for (const schema of allSchema) {
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length);

      for (const statement of statements) {
        await sql.query(statement);
      }
    }

    console.log("All tables created successfully.");

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;

    console.log("Tables in database:", tables.map(t => t.table_name));
  } catch (err) {
    console.error("Error:", err);
  }
}


setup();
