import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedSponsors() {
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

    // Clear existing sponsors
    await client.query("DELETE FROM \"Sponsor\"");
    console.log("Cleared existing sponsors");

    const sponsors = [
      // Platinum Sponsors
      {
        name: "LaunchGood",
        tier: "PLATINUM",
        logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300",
        websiteUrl: "https://www.launchgood.com",
        description: "The world's largest Islamic crowdfunding platform, helping Muslims launch campaigns for mosques, humanitarian aid, and community projects.",
      },
      {
        name: "Yaqeen Institute",
        tier: "PLATINUM",
        logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300",
        websiteUrl: "https://yaqeeninstitute.org",
        description: "A research institute that publishes academically-sound papers and videos on Islam to address common doubts and misconceptions.",
      },
      // Gold Sponsors
      {
        name: "Islamic Relief USA",
        tier: "GOLD",
        logoUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300",
        websiteUrl: "https://irusa.org",
        description: "A humanitarian relief and development organization providing aid to people in need regardless of race, religion, or gender.",
      },
      {
        name: "Penny Appeal USA",
        tier: "GOLD",
        logoUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300",
        websiteUrl: "https://pennyappealusa.org",
        description: "Small change, big difference. Transforming pennies into sustainable charity projects worldwide.",
      },
      {
        name: "Bayyinah Institute",
        tier: "GOLD",
        logoUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300",
        websiteUrl: "https://bayyinah.com",
        description: "Learn Arabic and understand the Quran with comprehensive courses taught by Ustadh Nouman Ali Khan.",
      },
      {
        name: "Helping Hand for Relief & Development",
        tier: "GOLD",
        logoUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300",
        websiteUrl: "https://hhrd.org",
        description: "Serving humanity globally through sustainable development, emergency relief, and orphan care programs.",
      },
      // Silver Sponsors
      {
        name: "AlMaghrib Institute",
        tier: "SILVER",
        logoUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300",
        websiteUrl: "https://almaghrib.org",
        description: "World-class Islamic seminars delivered by qualified scholars, bringing Islamic education to your city.",
      },
      {
        name: "Muslim Pro",
        tier: "SILVER",
        logoUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300",
        websiteUrl: "https://muslimpro.com",
        description: "The most popular Muslim app with prayer times, Quran, Qibla finder, and more. Used by over 150 million Muslims.",
      },
      {
        name: "Zakat Foundation of America",
        tier: "SILVER",
        logoUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300",
        websiteUrl: "https://zakat.org",
        description: "Distributing Zakat to those in need, providing emergency relief, education, and sustainable development.",
      },
      {
        name: "Guidance Residential",
        tier: "SILVER",
        logoUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300",
        websiteUrl: "https://guidanceresidential.com",
        description: "America's leading Islamic home financing company, offering Shariah-compliant mortgage alternatives.",
      },
      // Bronze Sponsors
      {
        name: "ICNA Relief",
        tier: "BRONZE",
        logoUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300",
        websiteUrl: "https://icnarelief.org",
        description: "Humanitarian assistance for all, providing food, shelter, disaster relief, and refugee services.",
      },
      {
        name: "Muslim Hands",
        tier: "BRONZE",
        logoUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300",
        websiteUrl: "https://muslimhands.org",
        description: "International humanitarian charity working to fight poverty and provide emergency relief worldwide.",
      },
      {
        name: "SoundVision",
        tier: "BRONZE",
        logoUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300",
        websiteUrl: "https://soundvision.com",
        description: "Creating quality Islamic content including books, games, and multimedia for Muslim families.",
      },
      {
        name: "Productive Muslim",
        tier: "BRONZE",
        logoUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300",
        websiteUrl: "https://productivemuslim.com",
        description: "Helping Muslims lead a productive lifestyle spiritually, physically, and socially.",
      },
    ];

    for (const sponsor of sponsors) {
      await client.query(
        `INSERT INTO "Sponsor" (id, name, tier, "logoUrl", website, description, "eventId")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
        [sponsor.name, sponsor.tier, sponsor.logoUrl, sponsor.websiteUrl, sponsor.description, eventId]
      );
    }

    console.log(`✅ Created ${sponsors.length} sponsors`);

    // Show breakdown by tier
    const tierCount = await client.query(`
      SELECT tier, COUNT(*) as count 
      FROM "Sponsor" 
      GROUP BY tier 
      ORDER BY 
        CASE tier 
          WHEN 'PLATINUM' THEN 1 
          WHEN 'GOLD' THEN 2 
          WHEN 'SILVER' THEN 3 
          WHEN 'BRONZE' THEN 4 
        END
    `);
    console.log("\n📊 Sponsors by tier:");
    for (const row of tierCount.rows) {
      console.log(`   ${row.tier}: ${row.count}`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

seedSponsors().catch(console.error);
