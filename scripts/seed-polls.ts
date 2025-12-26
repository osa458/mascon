import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedPolls() {
  const client = await pool.connect();
  
  try {
    // Get the event ID
    const eventResult = await client.query("SELECT id FROM \"Event\" LIMIT 1");
    if (eventResult.rows.length === 0) {
      console.error("No event found!");
      return;
    }
    const eventId = eventResult.rows[0].id;
    console.log(`Found event: ${eventId}`);

    // Check schema
    const schemaResult = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'Poll'
      ORDER BY ordinal_position
    `);
    console.log("Poll columns:", schemaResult.rows.map(r => `${r.column_name}(${r.data_type})`).join(", "));

    // Clear existing polls
    await client.query("DELETE FROM \"PollVote\"");
    await client.query("DELETE FROM \"PollOption\"");
    await client.query("DELETE FROM \"Poll\"");
    console.log("Cleared existing polls");

    const polls = [
      {
        question: "Which session are you most excited about?",
        options: ["Linguistic Miracles of the Quran", "Finding Purpose in the Modern World", "Stories of the Prophets", "Night of Remembrance", "Quran Competition Finals"],
        isActive: true,
      },
      {
        question: "How did you hear about MASCON 2025?",
        options: ["Social Media (Instagram/Facebook)", "Friend or Family", "Masjid Announcement", "Email Newsletter", "Podcast/YouTube", "Other"],
        isActive: true,
      },
      {
        question: "What topics would you like to see at MASCON 2026?",
        options: ["Mental Health & Wellness", "Youth Issues & Challenges", "Marriage & Family Life", "Islamic Finance & Career", "Dawah & Community Building", "Quran & Arabic Studies"],
        isActive: true,
      },
      {
        question: "How would you rate the food options?",
        options: ["Excellent - Great variety!", "Good - Satisfied", "Average - Could be better", "Poor - Need improvement"],
        isActive: true,
      },
      {
        question: "Are you interested in volunteering for MASCON 2026?",
        options: ["Yes, definitely!", "Maybe, need more info", "Not this time", "Already a volunteer"],
        isActive: true,
      },
      {
        question: "Which bazaar category interests you most?",
        options: ["Books & Education", "Islamic Clothing & Fashion", "Art & Home Decor", "Food & Snacks", "Technology & Apps"],
        isActive: true,
      },
      {
        question: "Would you recommend MASCON to others?",
        options: ["Absolutely! Already told friends", "Yes, would recommend", "Maybe, depends on next year's program", "Not sure"],
        isActive: true,
      },
      {
        question: "What's your preferred session format?",
        options: ["Large Main Hall lectures", "Smaller workshop sessions", "Panel discussions", "Q&A sessions", "Interactive activities"],
        isActive: false,
      },
    ];

    for (const poll of polls) {
      // Create poll
      const pollResult = await client.query(
        `INSERT INTO "Poll" (id, question, "isActive", "eventId", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())
         RETURNING id`,
        [poll.question, poll.isActive, eventId]
      );
      const pollId = pollResult.rows[0].id;

      // Create options for this poll
      for (const option of poll.options) {
        await client.query(
          `INSERT INTO "PollOption" (id, "pollId", text, "votesCount")
           VALUES (gen_random_uuid(), $1, $2, 0)`,
          [pollId, option]
        );
      }
    }

    console.log(`✅ Created ${polls.length} polls`);

    // Verify
    const count = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "isActive" THEN 1 ELSE 0 END) as active
      FROM "Poll"
    `);
    console.log(`\n📊 Poll breakdown:`);
    console.log(`   Total: ${count.rows[0].total}`);
    console.log(`   Active: ${count.rows[0].active}`);

  } finally {
    client.release();
    await pool.end();
  }
}

seedPolls().catch(console.error);
