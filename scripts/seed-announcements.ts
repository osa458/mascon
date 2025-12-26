import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAnnouncements() {
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
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Announcement'
      ORDER BY ordinal_position
    `);
    console.log("Announcement columns:", schemaResult.rows.map(r => r.column_name).join(", "));

    // Clear existing announcements
    await client.query("DELETE FROM \"Announcement\"");
    console.log("Cleared existing announcements");

    const announcements = [
      {
        title: "Welcome to MASCON 2025!",
        content: "Assalamu Alaikum wa Rahmatullahi wa Barakatuh! We are thrilled to welcome you to MASCON 2025. Please check in at the registration desk in the main lobby to receive your badge, welcome packet, and event guide. Our volunteers are here to help you navigate the venue.",
        isPinned: true,
      },
      {
        title: "Prayer Room Locations",
        content: "Prayer rooms are available on every floor of the convention center. The main prayer hall is located on the 1st floor near the Main Hall. Wudu facilities are located adjacent to each prayer room. Prayer times will be announced 10 minutes before each salah.",
        isPinned: true,
      },
      {
        title: "Free Childcare Services",
        content: "Complimentary childcare is available for children ages 2-10 during all main sessions. Please register at the Kids Zone on the 2nd floor. Children must be picked up within 15 minutes of session end times. Our trained staff ensures a safe and fun environment.",
        isPinned: true,
      },
      {
        title: "MASCON Bazaar Hours Extended!",
        content: "Due to popular demand, the MASCON Bazaar will remain open until 10 PM tonight! With over 50 vendors offering Islamic books, clothing, art, and more, don't miss this opportunity to shop and support Muslim-owned businesses.",
        isPinned: false,
      },
      {
        title: "Shuttle Service to Partner Hotels",
        content: "Free shuttle service is available every 30 minutes to our partner hotels. Pick up location is at Door 5 on the east side of the convention center. Last shuttle departs at 11:30 PM. Please show your badge to the driver.",
        isPinned: false,
      },
      {
        title: "Meet & Greet with Speakers",
        content: "Join us for an exclusive meet & greet session with our speakers today at 3:30 PM in the VIP Lounge. This is your chance to ask questions, take photos, and get books signed. Space is limited - first come, first served!",
        isPinned: false,
      },
      {
        title: "Lost & Found",
        content: "If you have lost any items, please visit the Information Desk in the main lobby. We have several items including phones, wallets, and prayer items waiting to be claimed. Items will be held for 30 days after the event.",
        isPinned: false,
      },
      {
        title: "Food Court Now Open",
        content: "The MASCON Food Court is now open with a variety of halal options! Choose from Mediterranean, Pakistani, Middle Eastern, and American cuisine. Located on the 1st floor near Gate C. Vegan and gluten-free options available.",
        isPinned: false,
      },
      {
        title: "Quran Competition Finals Tomorrow",
        content: "Don't miss the Quran Competition Finals tomorrow at 4:30 PM in the Main Hall! Watch our talented youth compete in recitation and memorization. Come support our young huffaz and be inspired by their beautiful recitation.",
        isPinned: false,
      },
      {
        title: "Download the MASCON App",
        content: "Make the most of your MASCON experience! Download our mobile app for real-time schedule updates, interactive maps, session reminders, and networking features. Available on iOS and Android.",
        isPinned: true,
      },
      {
        title: "Sisters Lounge Available",
        content: "A dedicated Sisters Lounge is available on the 2nd floor for nursing mothers and those needing a quiet space. The lounge includes comfortable seating, a nursing area, and prayer space. Open throughout the event.",
        isPinned: false,
      },
      {
        title: "Volunteer Appreciation",
        content: "A special thank you to our 200+ volunteers who are making MASCON 2025 possible! Your dedication and service are truly appreciated. May Allah reward you abundantly for your efforts.",
        isPinned: false,
      },
    ];

    for (const ann of announcements) {
      await client.query(
        `INSERT INTO "Announcement" (id, title, content, "isPinned", "eventId", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
        [ann.title, ann.content, ann.isPinned, eventId]
      );
    }

    console.log(`✅ Created ${announcements.length} announcements`);

    // Show breakdown
    const pinnedCount = await client.query(`
      SELECT 
        SUM(CASE WHEN "isPinned" THEN 1 ELSE 0 END) as pinned,
        SUM(CASE WHEN NOT "isPinned" THEN 1 ELSE 0 END) as not_pinned
      FROM "Announcement"
    `);
    console.log("\n📊 Announcements breakdown:");
    console.log(`   Pinned: ${pinnedCount.rows[0].pinned}`);
    console.log(`   Not pinned: ${pinnedCount.rows[0].not_pinned}`);

  } finally {
    client.release();
    await pool.end();
  }
}

seedAnnouncements().catch(console.error);
