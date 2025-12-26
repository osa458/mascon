import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedExhibitors() {
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

    // Check Exhibitor schema
    const schemaResult = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'Exhibitor'
      ORDER BY ordinal_position
    `);
    console.log("Exhibitor columns:", schemaResult.rows.map(r => r.column_name).join(", "));

    // Clear existing exhibitors
    await client.query("DELETE FROM \"Exhibitor\"");
    console.log("Cleared existing exhibitors");

    const exhibitors = [
      // Books & Education
      {
        name: "Dar-us-Salam Publications",
        booth: "A101",
        description: "Islamic books, Qurans, and educational materials. Extensive collection of tafsir, hadith, and fiqh books.",
        category: "Books & Education",
        logoUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300",
        website: "https://dar-us-salam.com",
      },
      {
        name: "IQRA International",
        booth: "A102",
        description: "Educational resources for Islamic schools and weekend programs. Curriculum, textbooks, and teaching aids.",
        category: "Books & Education",
        logoUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300",
        website: "https://iqra.org",
      },
      {
        name: "Kube Publishing",
        booth: "A103",
        description: "Publisher of Islamic books for children and adults. Fiction, non-fiction, and educational materials.",
        category: "Books & Education",
        logoUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300",
        website: "https://kubepublishing.com",
      },
      // Fashion & Clothing
      {
        name: "Modanisa",
        booth: "B101",
        description: "Modest fashion for the modern Muslim woman. Abayas, hijabs, and contemporary modest clothing.",
        category: "Fashion",
        logoUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300",
        website: "https://modanisa.com",
      },
      {
        name: "Shukr Islamic Clothing",
        booth: "B102",
        description: "Islamic clothing for men and women. Thobes, kufis, abayas, and everyday modest wear.",
        category: "Fashion",
        logoUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300",
        website: "https://shukr.com",
      },
      {
        name: "Haute Hijab",
        booth: "B103",
        description: "Premium hijabs and accessories. Luxury fabrics and modern styles for every occasion.",
        category: "Fashion",
        logoUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300",
        website: "https://hautehijab.com",
      },
      {
        name: "East Essence",
        booth: "B104",
        description: "Affordable Islamic clothing for the whole family. Wide range of sizes and styles.",
        category: "Fashion",
        logoUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300",
        website: "https://eastessence.com",
      },
      // Art & Home Decor
      {
        name: "Noor Art",
        booth: "C101",
        description: "Islamic art, calligraphy, and home decor. Canvas prints, wall art, and custom calligraphy.",
        category: "Art & Decor",
        logoUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300",
        website: "https://noorart.com",
      },
      {
        name: "Salam Arts",
        booth: "C102",
        description: "Handcrafted Islamic art pieces. Unique gifts and home decor items made by Muslim artisans.",
        category: "Art & Decor",
        logoUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300",
        website: "https://salamarts.com",
      },
      // Food & Wellness
      {
        name: "Halal Monitoring Committee",
        booth: "D101",
        description: "Halal certification services and education. Learn about halal standards and certified products.",
        category: "Services",
        logoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300",
        website: "https://halalhmc.org",
      },
      {
        name: "Sunnah Foods",
        booth: "D102",
        description: "Organic and prophetic foods. Black seed products, honey, dates, and natural remedies.",
        category: "Food & Wellness",
        logoUrl: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=300",
        website: "https://sunnahfoods.com",
      },
      // Charities & Non-Profits
      {
        name: "Muslim Hands",
        booth: "E101",
        description: "International humanitarian charity. Learn about sponsorship programs and relief efforts.",
        category: "Charity",
        logoUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300",
        website: "https://muslimhands.org",
      },
      {
        name: "Orphan Care",
        booth: "E102",
        description: "Orphan sponsorship and care programs. Support orphans worldwide with monthly sponsorship.",
        category: "Charity",
        logoUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300",
        website: "https://orphancare.org",
      },
      // Finance & Services
      {
        name: "Guidance Residential",
        booth: "F101",
        description: "Shariah-compliant home financing. Learn about Islamic mortgage alternatives.",
        category: "Finance",
        logoUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300",
        website: "https://guidanceresidential.com",
      },
      {
        name: "Azzad Asset Management",
        booth: "F102",
        description: "Halal investment funds and financial planning. Shariah-compliant retirement and investment options.",
        category: "Finance",
        logoUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300",
        website: "https://azzad.net",
      },
      // Technology & Apps
      {
        name: "Muslim Pro",
        booth: "G101",
        description: "The #1 Muslim app with prayer times, Quran, and more. Meet the team and learn about new features.",
        category: "Technology",
        logoUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300",
        website: "https://muslimpro.com",
      },
      {
        name: "Tarteel AI",
        booth: "G102",
        description: "AI-powered Quran companion. Get instant feedback on your recitation and memorization.",
        category: "Technology",
        logoUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300",
        website: "https://tarteel.ai",
      },
      // Travel & Umrah
      {
        name: "Rida Tours",
        booth: "H101",
        description: "Hajj and Umrah packages. Guided spiritual journeys with experienced scholars.",
        category: "Travel",
        logoUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=300",
        website: "https://ridatours.com",
      },
    ];

    for (const exhibitor of exhibitors) {
      await client.query(
        `INSERT INTO "Exhibitor" (id, name, "boothNumber", description, category, "logoUrl", website, "eventId")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
        [exhibitor.name, exhibitor.booth, exhibitor.description, exhibitor.category, exhibitor.logoUrl, exhibitor.website, eventId]
      );
    }

    console.log(`✅ Created ${exhibitors.length} exhibitors`);

    // Show breakdown by category
    const catCount = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM "Exhibitor" 
      GROUP BY category 
      ORDER BY count DESC
    `);
    console.log("\n📊 Exhibitors by category:");
    for (const row of catCount.rows) {
      console.log(`   ${row.category}: ${row.count}`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

seedExhibitors().catch(console.error);
