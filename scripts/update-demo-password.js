const bcrypt = require('bcrypt');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './.env' });


async function updatePassword() {
  const sql = neon(process.env.NEON_DATABASE_URL);
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log('Generated hash for "password123":', hashedPassword);
  
  await sql`
    INSERT INTO users (username, email, password_hash, role, credits) 
    VALUES ('demo', 'demo@example.com', ${hashedPassword}, 'user', 1000);
  `;
  
  const adminHash = await bcrypt.hash('admin123', 10);
  console.log('[Generated hash for "admin123":', adminHash);
  

  await sql`
    INSERT INTO users (username, email, password_hash, role, credits) 
    VALUES ('admin', 'admin@example.com', ${adminHash}, 'admin', 10000);
  `;
  
}

updatePassword().catch(console.error);
