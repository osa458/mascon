import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedUsers() {
  const client = await pool.connect();
  
  try {
    // Check User schema
    const schemaResult = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `);
    console.log("User columns:", schemaResult.rows.map(r => `${r.column_name}`).join(", "));

    // Clear existing users (except speakers we already have linked)
    // Actually, let's keep existing and add more
    const existingCount = await client.query("SELECT COUNT(*) FROM \"User\"");
    console.log(`Existing users: ${existingCount.rows[0].count}`);

    const users = [
      // Admin
      { name: "MASCON Admin", email: "admin@mascon.org", title: "Event Administrator", company: "MASCON" },
      
      // Attendees with realistic names
      { name: "Ahmad Hassan", email: "ahmad.hassan@gmail.com", title: "Software Engineer", company: "Google" },
      { name: "Fatima Ali", email: "fatima.ali@gmail.com", title: "Doctor", company: "Houston Medical Center" },
      { name: "Omar Khan", email: "omar.khan@gmail.com", title: "Teacher", company: "Al-Noor Academy" },
      { name: "Aisha Rahman", email: "aisha.rahman@gmail.com", title: "Lawyer", company: "Rahman & Associates" },
      { name: "Yusuf Ahmed", email: "yusuf.ahmed@gmail.com", title: "Entrepreneur", company: "Halal Foods Inc" },
      { name: "Khadija Mahmoud", email: "khadija.m@gmail.com", title: "Marketing Manager", company: "Islamic Relief" },
      { name: "Ibrahim Patel", email: "ibrahim.patel@gmail.com", title: "Pharmacist", company: "CVS Health" },
      { name: "Maryam Johnson", email: "maryam.j@gmail.com", title: "Graphic Designer", company: "Noor Design Studio" },
      { name: "Bilal Williams", email: "bilal.w@gmail.com", title: "Imam", company: "Masjid Al-Taqwa" },
      { name: "Zainab Hussein", email: "zainab.h@gmail.com", title: "Nurse", company: "Texas Children's Hospital" },
      { name: "Muhammad Lee", email: "muhammad.lee@gmail.com", title: "Accountant", company: "Deloitte" },
      { name: "Sarah Abdullah", email: "sarah.abdullah@gmail.com", title: "Social Worker", company: "ICNA Relief" },
      { name: "Ali Thompson", email: "ali.thompson@gmail.com", title: "Engineer", company: "ExxonMobil" },
      { name: "Layla Garcia", email: "layla.garcia@gmail.com", title: "Professor", company: "Rice University" },
      { name: "Hassan Brooks", email: "hassan.brooks@gmail.com", title: "Dentist", company: "Smile Care Dental" },
      { name: "Amina Cooper", email: "amina.cooper@gmail.com", title: "Writer", company: "Muslim Matters" },
      { name: "Kareem Washington", email: "kareem.w@gmail.com", title: "Chef", company: "Saffron Kitchen" },
      { name: "Nadia Hernandez", email: "nadia.h@gmail.com", title: "Architect", company: "Studio Hijra" },
      { name: "Tariq Martinez", email: "tariq.martinez@gmail.com", title: "Financial Advisor", company: "Azzad Asset Management" },
      { name: "Samira Nguyen", email: "samira.nguyen@gmail.com", title: "Data Scientist", company: "Amazon" },
      { name: "Rashid Kim", email: "rashid.kim@gmail.com", title: "Physician", company: "MD Anderson" },
      { name: "Hana Peterson", email: "hana.peterson@gmail.com", title: "Counselor", company: "Khalil Center" },
      { name: "Jamal Roberts", email: "jamal.roberts@gmail.com", title: "IT Manager", company: "Microsoft" },
      { name: "Yasmin Clark", email: "yasmin.clark@gmail.com", title: "Event Planner", company: "Baraka Events" },
      { name: "Idris Taylor", email: "idris.taylor@gmail.com", title: "Realtor", company: "Guidance Residential" },
      { name: "Sumaya Anderson", email: "sumaya.a@gmail.com", title: "YouTuber", company: "Modest Fashion" },
      { name: "Hamza Jackson", email: "hamza.jackson@gmail.com", title: "Chaplain", company: "University of Houston" },
      { name: "Ruqayyah White", email: "ruqayyah.w@gmail.com", title: "Researcher", company: "Yaqeen Institute" },
      { name: "Umar Davis", email: "umar.davis@gmail.com", title: "Business Owner", company: "Crescent Books" },
      { name: "Hafsa Miller", email: "hafsa.miller@gmail.com", title: "Journalist", company: "Al Jazeera" },
      { name: "Sulaiman Brown", email: "sulaiman.brown@gmail.com", title: "Project Manager", company: "BP" },
      { name: "Asma Wilson", email: "asma.wilson@gmail.com", title: "Nutritionist", company: "Sunnah Health" },
      { name: "Ismail Moore", email: "ismail.moore@gmail.com", title: "Photographer", company: "Noor Photography" },
      { name: "Zahra Taylor", email: "zahra.taylor@gmail.com", title: "Teacher", company: "Iman Academy" },
    ];

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if user already exists
      const existing = await client.query(
        "SELECT id FROM \"User\" WHERE email = $1",
        [user.email]
      );

      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO "User" (id, name, email, title, company, "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
          [user.name, user.email, user.title, user.company]
        );
        created++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ Created ${created} new users (${skipped} already existed)`);

    // Show total count
    const total = await client.query("SELECT COUNT(*) FROM \"User\"");
    console.log(`\n📊 Total users: ${total.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers().catch(console.error);
