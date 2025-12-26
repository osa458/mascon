import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedSessions() {
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

    // Get speakers
    const speakerResult = await client.query("SELECT id, name FROM \"Speaker\"");
    const speakers: Record<string, string> = {};
    for (const row of speakerResult.rows) {
      speakers[row.name] = row.id;
    }
    console.log(`Found ${Object.keys(speakers).length} speakers`);

    // Clear existing sessions
    await client.query("DELETE FROM \"SessionSpeaker\"");
    await client.query("DELETE FROM \"EventSession\"");
    console.log("Cleared existing sessions");

    // Helper to create session
    async function createSession(
      title: string,
      description: string,
      startTime: string,
      endTime: string,
      sessionType: string,
      track: string,
      speakerName?: string
    ) {
      const result = await client.query(
        `INSERT INTO "EventSession" (id, title, description, "startTime", "endTime", "sessionType", track, "eventId", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [title, description, startTime, endTime, sessionType, track, eventId]
      );
      
      const sessionId = result.rows[0].id;
      
      // Link speaker if provided
      if (speakerName && speakers[speakerName]) {
        await client.query(
          `INSERT INTO "SessionSpeaker" (id, "sessionId", "speakerId")
           VALUES (gen_random_uuid(), $1, $2)`,
          [sessionId, speakers[speakerName]]
        );
      }
      
      return sessionId;
    }

    // ========== DAY 1: July 4, 2025 (Friday) ==========
    console.log("\n📅 Creating Day 1 sessions (July 4 - Friday)...");

    await createSession(
      "Opening Ceremony & Quran Recitation",
      "Welcome to MASCON 2025! Join us for a beautiful Quran recitation and welcome remarks from the organizing committee. Experience the spiritual atmosphere as we begin this blessed gathering.",
      "2025-07-04T09:00:00Z",
      "2025-07-04T10:00:00Z",
      "MAIN",
      "General"
    );

    await createSession(
      "Finding Purpose in the Modern World",
      "An inspiring keynote on discovering your life's purpose through the lens of Islamic teachings and Prophetic guidance. Learn how to navigate the challenges of modern life while staying true to your faith.",
      "2025-07-04T10:30:00Z",
      "2025-07-04T12:00:00Z",
      "MAIN",
      "Spirituality",
      "Sh. Omar Suleiman"
    );

    await createSession(
      "Linguistic Miracles of the Quran",
      "Explore the miraculous nature of Quranic Arabic and discover hidden linguistic gems that will transform your relationship with the Quran. This session unveils the literary beauty that makes the Quran inimitable.",
      "2025-07-04T10:30:00Z",
      "2025-07-04T12:00:00Z",
      "LECTURE",
      "Quran Studies",
      "Ustadh Nouman Ali Khan"
    );

    await createSession(
      "Sisters Circle: Strength Through Sisterhood",
      "A special session for sisters focusing on building strong bonds of sisterhood, supporting each other through life's challenges, and growing together in faith.",
      "2025-07-04T10:30:00Z",
      "2025-07-04T12:00:00Z",
      "WORKSHOP",
      "Sisters",
      "Ustadha Yasmin Mogahed"
    );

    await createSession(
      "Jumu'ah Prayer",
      "Congregational Friday prayer. Khutbah will be delivered by our guest scholar.",
      "2025-07-04T13:00:00Z",
      "2025-07-04T14:00:00Z",
      "PRAYER",
      "Prayer",
      "Dr. Yasir Qadhi"
    );

    await createSession(
      "Purification of the Heart",
      "A deep dive into the diseases of the heart and their cures according to Islamic tradition. Learn about envy, arrogance, attachment, and how to purify your heart from these spiritual ailments.",
      "2025-07-04T14:30:00Z",
      "2025-07-04T16:00:00Z",
      "MAIN",
      "Spirituality",
      "Dr. Yasir Qadhi"
    );

    await createSession(
      "Healing Hearts: Dealing with Anxiety and Depression",
      "A practical session combining Islamic wisdom with modern psychology to address mental health challenges. Learn coping strategies rooted in faith and evidence-based practices.",
      "2025-07-04T14:30:00Z",
      "2025-07-04T16:00:00Z",
      "WORKSHOP",
      "Wellness",
      "Dr. Haifaa Younis"
    );

    await createSession(
      "Youth Town Hall: Your Questions Answered",
      "An open Q&A session where young Muslims can ask anything about faith, life, relationships, and navigating challenges. No question is off limits!",
      "2025-07-04T14:30:00Z",
      "2025-07-04T16:00:00Z",
      "PANEL",
      "Youth"
    );

    await createSession(
      "Asr Prayer",
      "Congregational Asr prayer.",
      "2025-07-04T16:30:00Z",
      "2025-07-04T17:00:00Z",
      "PRAYER",
      "Prayer"
    );

    await createSession(
      "Stories of the Prophets: Lessons for Today",
      "Extract timeless lessons from the stories of the Prophets that are directly applicable to our lives today. Discover how their struggles and triumphs guide us through modern challenges.",
      "2025-07-04T17:15:00Z",
      "2025-07-04T18:45:00Z",
      "MAIN",
      "Seerah",
      "Mufti Ismail Menk"
    );

    await createSession(
      "Maghrib Prayer & Dinner",
      "Congregational Maghrib prayer followed by dinner. Enjoy delicious halal food while networking with fellow attendees.",
      "2025-07-04T19:00:00Z",
      "2025-07-04T20:30:00Z",
      "BREAK",
      "Prayer"
    );

    await createSession(
      "Night of Remembrance",
      "A special evening of dhikr, nasheed, and spiritual reflection. Let your heart find peace in the remembrance of Allah as we close Day 1.",
      "2025-07-04T21:00:00Z",
      "2025-07-04T23:00:00Z",
      "MAIN",
      "Spirituality"
    );

    // ========== DAY 2: July 5, 2025 (Saturday) ==========
    console.log("📅 Creating Day 2 sessions (July 5 - Saturday)...");

    await createSession(
      "Fajr Prayer & Morning Adhkar",
      "Start your day with Fajr prayer followed by collective morning remembrances. Experience the barakah of the early morning hours.",
      "2025-07-05T05:30:00Z",
      "2025-07-05T06:30:00Z",
      "PRAYER",
      "Prayer"
    );

    await createSession(
      "The Seerah: Leadership Lessons from the Prophet ﷺ",
      "Learn leadership principles from the life of Prophet Muhammad ﷺ. Discover how he built teams, handled conflict, and inspired generations.",
      "2025-07-05T10:00:00Z",
      "2025-07-05T11:30:00Z",
      "MAIN",
      "Seerah",
      "Dr. Yasir Qadhi"
    );

    await createSession(
      "Being Muslim in America: Challenges and Opportunities",
      "An engaging panel discussion about the unique experience of being Muslim in America. Topics include identity, belonging, civic engagement, and raising the next generation.",
      "2025-07-05T10:00:00Z",
      "2025-07-05T11:30:00Z",
      "PANEL",
      "Community",
      "Dr. Ingrid Mattson"
    );

    await createSession(
      "Raising Righteous Children",
      "Practical tips for parents on raising children with strong Islamic values in the modern world. Learn age-appropriate strategies for instilling faith, character, and resilience.",
      "2025-07-05T10:00:00Z",
      "2025-07-05T11:30:00Z",
      "WORKSHOP",
      "Family",
      "Sh. Yaser Birjas"
    );

    await createSession(
      "Quran Intensive: Tajweed Foundations",
      "Perfect your Quran recitation with this hands-on tajweed workshop. Learn the rules and practice in a supportive environment.",
      "2025-07-05T10:00:00Z",
      "2025-07-05T11:30:00Z",
      "WORKSHOP",
      "Quran Studies",
      "Ustadha Taimiyyah Zubair"
    );

    await createSession(
      "Dhuhr Prayer",
      "Congregational Dhuhr prayer.",
      "2025-07-05T13:00:00Z",
      "2025-07-05T13:30:00Z",
      "PRAYER",
      "Prayer"
    );

    await createSession(
      "Understanding Islamic Finance",
      "A comprehensive overview of Islamic finance principles and halal investment options. Learn about avoiding riba, Islamic mortgages, halal investments, and financial planning.",
      "2025-07-05T14:00:00Z",
      "2025-07-05T15:30:00Z",
      "WORKSHOP",
      "Finance"
    );

    await createSession(
      "Motivation from Within: Islamic Productivity",
      "Discover how to maximize your productivity using Islamic principles and the Sunnah. Learn about barakah in time, prioritization, and the prophetic work ethic.",
      "2025-07-05T14:00:00Z",
      "2025-07-05T15:30:00Z",
      "LECTURE",
      "Personal Development",
      "Mufti Ismail Menk"
    );

    await createSession(
      "Converts Corner: Your Journey Matters",
      "A supportive session for converts to share experiences, ask questions, and connect with fellow Muslims who understand their unique journey.",
      "2025-07-05T14:00:00Z",
      "2025-07-05T15:30:00Z",
      "WORKSHOP",
      "Community"
    );

    await createSession(
      "Asr Prayer",
      "Congregational Asr prayer.",
      "2025-07-05T16:00:00Z",
      "2025-07-05T16:30:00Z",
      "PRAYER",
      "Prayer"
    );

    await createSession(
      "Quran Competition Finals",
      "Watch the finalists compete in the annual MASCON Quran Competition. Witness beautiful recitations and celebrate our talented youth.",
      "2025-07-05T16:45:00Z",
      "2025-07-05T18:30:00Z",
      "MAIN",
      "Quran Studies"
    );

    await createSession(
      "Maghrib Prayer & Dinner",
      "Congregational Maghrib prayer followed by dinner.",
      "2025-07-05T19:00:00Z",
      "2025-07-05T20:30:00Z",
      "BREAK",
      "Prayer"
    );

    await createSession(
      "Brothers Session: Men of Purpose",
      "An exclusive session for brothers on fulfilling their responsibilities as Muslim men. Topics include leadership in the home, protecting the family, and being a role model.",
      "2025-07-05T21:00:00Z",
      "2025-07-05T22:30:00Z",
      "LECTURE",
      "Brothers",
      "Imam Zaid Shakir"
    );

    await createSession(
      "Sisters Session: Women of Strength",
      "An exclusive session for sisters celebrating Muslim women and their unique roles. Explore spiritual growth, leadership, and the legacy of great Muslim women.",
      "2025-07-05T21:00:00Z",
      "2025-07-05T22:30:00Z",
      "LECTURE",
      "Sisters",
      "Ustadha Yasmin Mogahed"
    );

    await createSession(
      "Late Night Qiyam",
      "Join us for a special night prayer session. Experience the tranquility of standing before Allah in the quiet of the night.",
      "2025-07-05T23:00:00Z",
      "2025-07-06T00:30:00Z",
      "PRAYER",
      "Prayer"
    );

    // ========== DAY 3: July 6, 2025 (Sunday) ==========
    console.log("📅 Creating Day 3 sessions (July 6 - Sunday)...");

    await createSession(
      "Fajr Prayer & Morning Adhkar",
      "Start your final day with Fajr prayer and morning remembrances.",
      "2025-07-06T05:30:00Z",
      "2025-07-06T06:30:00Z",
      "PRAYER",
      "Prayer"
    );

    await createSession(
      "Tafsir Session: Surah Al-Kahf",
      "An in-depth explanation of Surah Al-Kahf and its lessons for modern times. Discover the four trials mentioned and how to protect yourself from the greatest fitnah.",
      "2025-07-06T10:00:00Z",
      "2025-07-06T11:30:00Z",
      "MAIN",
      "Quran Studies",
      "Ustadh Nouman Ali Khan"
    );

    await createSession(
      "Dawah in the Digital Age",
      "Learn effective strategies for sharing Islam through social media and online platforms. Understand how to represent Islam positively and address common misconceptions.",
      "2025-07-06T10:00:00Z",
      "2025-07-06T11:30:00Z",
      "WORKSHOP",
      "Community",
      "Sh. Omar Suleiman"
    );

    await createSession(
      "Marriage Workshop: Building Strong Foundations",
      "Essential guidance for couples and those seeking marriage on building and maintaining a strong Islamic marriage. Topics include communication, conflict resolution, and maintaining love.",
      "2025-07-06T10:00:00Z",
      "2025-07-06T11:30:00Z",
      "WORKSHOP",
      "Family",
      "Sh. Yaser Birjas"
    );

    await createSession(
      "Kids Quran & Nasheeds",
      "A fun session for kids with Quran activities, games, and nasheeds. Parents can attend other sessions while kids enjoy this supervised program.",
      "2025-07-06T10:00:00Z",
      "2025-07-06T11:30:00Z",
      "KIDS",
      "Kids"
    );

    await createSession(
      "Dhuhr Prayer",
      "Congregational Dhuhr prayer.",
      "2025-07-06T13:00:00Z",
      "2025-07-06T13:30:00Z",
      "PRAYER",
      "Prayer"
    );

    await createSession(
      "Reclaim Your Heart",
      "Based on her bestselling book, Ustadha Yasmin shares insights on healing from heartbreak, detachment from the dunya, and finding peace in Allah alone.",
      "2025-07-06T14:00:00Z",
      "2025-07-06T15:30:00Z",
      "MAIN",
      "Spirituality",
      "Ustadha Yasmin Mogahed"
    );

    await createSession(
      "Aqeedah 101: Foundations of Faith",
      "A foundational session on Islamic creed and beliefs. Understand the core tenets of faith and how they shape our worldview and actions.",
      "2025-07-06T14:00:00Z",
      "2025-07-06T15:30:00Z",
      "LECTURE",
      "Theology",
      "Dr. Yasir Qadhi"
    );

    await createSession(
      "Social Justice in Islam",
      "Explore the Islamic framework for social justice, equity, and standing up against oppression. Learn how to be an effective advocate while staying true to Islamic principles.",
      "2025-07-06T14:00:00Z",
      "2025-07-06T15:30:00Z",
      "LECTURE",
      "Community",
      "Imam Zaid Shakir"
    );

    await createSession(
      "Asr Prayer",
      "Congregational Asr prayer.",
      "2025-07-06T16:00:00Z",
      "2025-07-06T16:30:00Z",
      "PRAYER",
      "Prayer"
    );

    await createSession(
      "Community Building: From Masjid to Movement",
      "A panel discussion on strategies for building strong, impactful Muslim communities. Learn from successful community leaders and activists.",
      "2025-07-06T17:00:00Z",
      "2025-07-06T18:00:00Z",
      "PANEL",
      "Community"
    );

    await createSession(
      "Closing Ceremony & Collective Dua",
      "Join us for the closing ceremony featuring final remarks, awards, and a special collective dua. Let's end MASCON 2025 with hearts full of gratitude and hope.",
      "2025-07-06T18:30:00Z",
      "2025-07-06T20:00:00Z",
      "MAIN",
      "General"
    );

    // Verify
    const count = await client.query("SELECT COUNT(*) FROM \"EventSession\"");
    console.log(`\n✅ Total sessions created: ${count.rows[0].count}`);

    const speakerLinks = await client.query("SELECT COUNT(*) FROM \"SessionSpeaker\"");
    console.log(`✅ Total speaker-session links: ${speakerLinks.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

seedSessions().catch(console.error);
