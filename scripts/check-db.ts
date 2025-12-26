import * as dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Using:", process.env.DATABASE_URL?.substring(0, 60) + "...");
  
  const res = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM "User") as users,
      (SELECT COUNT(*) FROM "Event") as events,
      (SELECT COUNT(*) FROM "EventSession") as sessions,
      (SELECT COUNT(*) FROM "Speaker") as speakers,
      (SELECT COUNT(*) FROM "Sponsor") as sponsors,
      (SELECT COUNT(*) FROM "Exhibitor") as exhibitors,
      (SELECT COUNT(*) FROM "Announcement") as announcements,
      (SELECT COUNT(*) FROM "ResourceTile") as resources,
      (SELECT COUNT(*) FROM "Poll") as polls,
      (SELECT COUNT(*) FROM "PollOption") as poll_options
  `);
  
  console.log("\n📊 MASCON Database Status:");
  console.table(res.rows[0]);
  await pool.end();
}

main().catch(console.error);
