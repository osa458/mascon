import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedSpeakers() {
  const client = await pool.connect();
  
  try {
    // Get the event ID
    const eventResult = await client.query("SELECT id FROM \"Event\" LIMIT 1");
    if (eventResult.rows.length === 0) {
      console.error("No event found! Please seed event first.");
      return;
    }
    const eventId = eventResult.rows[0].id;
    console.log(`Found event: ${eventId}`);

    // Clear existing speakers
    await client.query("DELETE FROM \"Speaker\"");
    console.log("Cleared existing speakers");

    // Insert comprehensive speaker data
    const speakers = [
      {
        name: "Dr. Yasir Qadhi",
        title: "Dean of Academic Affairs, AlMaghrib Institute",
        bio: "Dr. Yasir Qadhi is one of the most influential Islamic scholars in the Western world. He holds a PhD in Religious Studies from Yale University and has authored numerous books on Islamic theology and history. He is known for his deep knowledge of Islamic sciences and his ability to make complex topics accessible.",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        email: "yasir.qadhi@mascon.org",
      },
      {
        name: "Sh. Omar Suleiman",
        title: "Founder & President, Yaqeen Institute",
        bio: "Sheikh Omar Suleiman is the founder and president of Yaqeen Institute for Islamic Research. He is a civil rights leader, motivational speaker, and adjunct professor at Southern Methodist University. His work focuses on spirituality, social justice, and building bridges between communities.",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        email: "omar.suleiman@mascon.org",
      },
      {
        name: "Ustadh Nouman Ali Khan",
        title: "Founder & CEO, Bayyinah Institute",
        bio: "Nouman Ali Khan is the founder and CEO of Bayyinah Institute, a leading Arabic and Quranic studies institution. He is renowned worldwide for his deep linguistic analysis of the Quran and his unique ability to make Quranic teachings relevant to modern life.",
        photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        email: "nouman.khan@mascon.org",
      },
      {
        name: "Mufti Ismail Menk",
        title: "Grand Mufti of Zimbabwe",
        bio: "Mufti Ismail Menk is a globally recognized Islamic scholar from Zimbabwe. Known for his engaging and often humorous lectures, he has millions of followers on social media. His topics range from personal development to family matters to spiritual growth.",
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
        email: "mufti.menk@mascon.org",
      },
      {
        name: "Ustadha Yasmin Mogahed",
        title: "Instructor & Author",
        bio: "Yasmin Mogahed is an internationally acclaimed speaker and author of the bestselling book 'Reclaim Your Heart'. She holds a degree in Psychology and a Master's in Journalism. Her work focuses on spiritual development, relationships, and healing.",
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        email: "yasmin.mogahed@mascon.org",
      },
      {
        name: "Dr. Ingrid Mattson",
        title: "Islamic Studies Professor",
        bio: "Dr. Ingrid Mattson is a renowned Islamic scholar and the first woman to serve as president of ISNA. She is Professor Emerita at Huron University College and has dedicated her career to interfaith dialogue and Islamic education.",
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        email: "ingrid.mattson@mascon.org",
      },
      {
        name: "Imam Zaid Shakir",
        title: "Co-Founder, Zaytuna College",
        bio: "Imam Zaid Shakir is a co-founder of Zaytuna College, the first accredited Muslim liberal arts college in America. He is a scholar, author, and activist known for his work on social justice and Islamic spirituality.",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        email: "zaid.shakir@mascon.org",
      },
      {
        name: "Dr. Haifaa Younis",
        title: "Founder, Jannah Institute",
        bio: "Dr. Haifaa Younis is a practicing physician and the founder of Jannah Institute. She is known for her courses on Islamic spirituality and her focus on connecting with the Quran. She holds an ijazah in Quran recitation.",
        photoUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400",
        email: "haifaa.younis@mascon.org",
      },
      {
        name: "Sh. Yaser Birjas",
        title: "Head of Islamic Law, AlMaghrib Institute",
        bio: "Sheikh Yaser Birjas is the Head of Islamic Law and Instructor at AlMaghrib Institute. He holds degrees from Islamic University of Madinah and is known for his expertise in Islamic family law and personal development.",
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        email: "yaser.birjas@mascon.org",
      },
      {
        name: "Ustadha Taimiyyah Zubair",
        title: "Instructor, Al-Huda Institute",
        bio: "Ustadha Taimiyyah Zubair is a renowned teacher of Quran and Islamic sciences. She has taught thousands of students through her detailed and accessible courses on Quranic tafsir and hadith sciences.",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        email: "taimiyyah.zubair@mascon.org",
      },
    ];

    for (const speaker of speakers) {
      await client.query(
        `INSERT INTO "Speaker" (id, name, title, bio, "imageUrl", "eventId")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
        [speaker.name, speaker.title, speaker.bio, speaker.photoUrl, eventId]
      );
    }

    console.log(`✅ Created ${speakers.length} speakers`);

    // Verify
    const count = await client.query("SELECT COUNT(*) FROM \"Speaker\"");
    console.log(`Total speakers in database: ${count.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

seedSpeakers().catch(console.error);
