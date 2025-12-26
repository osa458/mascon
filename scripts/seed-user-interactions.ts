import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Main test user that will have all interactions
const TEST_USER = {
  email: 'osama@mascon.org',
  name: 'Osama Habdallah',
  title: 'Software Engineer',
  company: 'MASCON',
  bio: 'Event organizer and tech lead for MASCON 2025. Passionate about building technology that serves the Muslim community.',
  linkedin: 'https://linkedin.com/in/osamahabdallah',
  shareEmail: true,
  sharePhone: false,
}

async function getEventId(): Promise<string> {
  const { rows } = await pool.query('SELECT id FROM "Event" LIMIT 1')
  return rows[0]?.id
}

async function createOrUpdateTestUser(): Promise<string> {
  console.log('👤 Creating/updating test user...')
  
  // Check if user exists
  const { rows: existingUsers } = await pool.query(
    'SELECT id FROM "User" WHERE email = $1',
    [TEST_USER.email]
  )
  
  if (existingUsers.length > 0) {
    // Update existing user
    const userId = existingUsers[0].id
    await pool.query(
      `UPDATE "User" SET 
        name = $1, title = $2, company = $3, bio = $4, 
        linkedin = $5, "shareEmail" = $6, "sharePhone" = $7,
        "emailVerified" = NOW()
      WHERE id = $8`,
      [TEST_USER.name, TEST_USER.title, TEST_USER.company, TEST_USER.bio,
       TEST_USER.linkedin, TEST_USER.shareEmail, TEST_USER.sharePhone, userId]
    )
    console.log(`  ✅ Updated existing user: ${TEST_USER.name} (${userId})`)
    return userId
  }
  
  // Create new user
  const { rows } = await pool.query(
    `INSERT INTO "User" (id, email, name, title, company, bio, linkedin, "shareEmail", "sharePhone", "emailVerified", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
     RETURNING id`,
    [TEST_USER.email, TEST_USER.name, TEST_USER.title, TEST_USER.company, 
     TEST_USER.bio, TEST_USER.linkedin, TEST_USER.shareEmail, TEST_USER.sharePhone]
  )
  
  console.log(`  ✅ Created new user: ${TEST_USER.name} (${rows[0].id})`)
  return rows[0].id
}

async function createEventRole(userId: string, eventId: string) {
  console.log('🎫 Creating event role...')
  
  // Check if role exists
  const { rows: existing } = await pool.query(
    'SELECT id FROM "EventRole" WHERE "userId" = $1 AND "eventId" = $2',
    [userId, eventId]
  )
  
  if (existing.length === 0) {
    await pool.query(
      `INSERT INTO "EventRole" (id, "userId", "eventId", role, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, 'ADMIN', NOW())`,
      [userId, eventId]
    )
    console.log('  ✅ Created ADMIN event role')
  } else {
    console.log('  ℹ️ Event role already exists')
  }
}

async function seedMyAgendaItems(userId: string) {
  console.log('📅 Seeding agenda favorites...')
  
  // Get some sessions to add to my agenda
  const { rows: sessions } = await pool.query(
    'SELECT id, title FROM "EventSession" ORDER BY "startTime" LIMIT 15'
  )
  
  let addedCount = 0
  for (const session of sessions) {
    // Check if already added
    const { rows: existing } = await pool.query(
      'SELECT id FROM "MyAgendaItem" WHERE "userId" = $1 AND "sessionId" = $2',
      [userId, session.id]
    )
    
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO "MyAgendaItem" (id, "userId", "sessionId", "eventId", "isCustom", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, (SELECT "eventId" FROM "EventSession" WHERE id = $2), false, NOW())`,
        [userId, session.id]
      )
      addedCount++
    }
  }
  console.log(`  ✅ Added ${addedCount} sessions to My Agenda`)
}

async function seedPollVotes(userId: string) {
  console.log('🗳️ Seeding poll votes...')
  
  // Get all polls with their options
  const { rows: polls } = await pool.query(
    `SELECT p.id as poll_id, po.id as option_id, po.text
     FROM "Poll" p
     JOIN "PollOption" po ON po."pollId" = p.id
     ORDER BY p.id, po.id`
  )
  
  // Group options by poll
  const pollOptions = new Map<string, Array<{id: string, text: string}>>()
  for (const row of polls) {
    if (!pollOptions.has(row.poll_id)) {
      pollOptions.set(row.poll_id, [])
    }
    pollOptions.get(row.poll_id)!.push({ id: row.option_id, text: row.text })
  }
  
  let voteCount = 0
  for (const [pollId, options] of pollOptions) {
    // Pick a random option to vote for
    const randomOption = options[Math.floor(Math.random() * options.length)]
    
    // Check if already voted
    const { rows: existing } = await pool.query(
      'SELECT id FROM "PollVote" WHERE "optionId" = $1 AND "userId" = $2',
      [randomOption.id, userId]
    )
    
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO "PollVote" (id, "optionId", "userId")
         VALUES (gen_random_uuid(), $1, $2)`,
        [randomOption.id, userId]
      )
      
      // Increment vote count
      await pool.query(
        'UPDATE "PollOption" SET "votesCount" = "votesCount" + 1 WHERE id = $1',
        [randomOption.id]
      )
      
      voteCount++
    }
  }
  console.log(`  ✅ Cast ${voteCount} poll votes`)
}

async function seedNotes(userId: string) {
  console.log('📝 Seeding session notes...')
  
  // Get some sessions to add notes to
  const { rows: sessions } = await pool.query(
    'SELECT id, title FROM "EventSession" ORDER BY "startTime" LIMIT 8'
  )
  
  const sampleNotes = [
    "Key takeaway: Focus on building strong foundations in aqeedah before moving to advanced topics.",
    "Amazing session! The speaker emphasized the importance of consistency over intensity in worship.",
    "Important reminder about the role of intention (niyyah) in all our actions.",
    "Practical tips: Set specific goals for Ramadan preparation starting 60 days before.",
    "The discussion on balancing dunya and akhirah was very insightful. Need to review priorities.",
    "Great framework for understanding the maqasid al-shariah and how it applies to modern issues.",
    "Speaker recommended several books - need to check out 'Purification of the Heart'.",
    "Key hadith mentioned: 'The best of you are those who learn the Quran and teach it.'",
  ]
  
  let noteCount = 0
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i]
    
    // Check if note exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM "Note" WHERE "userId" = $1 AND "sessionId" = $2',
      [userId, session.id]
    )
    
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO "Note" (id, "userId", "sessionId", content, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())`,
        [userId, session.id, sampleNotes[i]]
      )
      noteCount++
    }
  }
  console.log(`  ✅ Created ${noteCount} session notes`)
}

async function seedQAQuestions(userId: string) {
  console.log('❓ Seeding Q&A questions...')
  
  // Get some sessions
  const { rows: sessions } = await pool.query(
    `SELECT id, title FROM "EventSession" 
     WHERE "sessionType" IN ('keynote', 'panel', 'workshop') 
     ORDER BY "startTime" LIMIT 6`
  )
  
  const sampleQuestions = [
    "How can we better integrate Islamic values in our daily professional work?",
    "What are the most effective methods for teaching Quran to children in the West?",
    "Can you elaborate on the balance between trust in Allah (tawakkul) and taking practical steps?",
    "How should Muslims approach interfaith dialogue while maintaining our principles?",
    "What role does community play in maintaining faith in non-Muslim majority countries?",
    "How do we address doubts that arise from consuming secular academic content?",
  ]
  
  let questionCount = 0
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i]
    
    await pool.query(
      `INSERT INTO "QAQuestion" (id, "sessionId", "userId", content, "isAnonymous", "isAnswered", "votesCount", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
      [session.id, userId, sampleQuestions[i], i % 3 === 0, i < 2, Math.floor(Math.random() * 15)]
    )
    questionCount++
  }
  console.log(`  ✅ Created ${questionCount} Q&A questions`)
}

async function seedContactExchanges(userId: string, eventId: string) {
  console.log('📇 Seeding contact exchanges...')
  
  // Get some other users to exchange contacts with
  const { rows: otherUsers } = await pool.query(
    `SELECT id, name FROM "User" WHERE id != $1 ORDER BY random() LIMIT 10`,
    [userId]
  )
  
  let exchangeCount = 0
  for (const otherUser of otherUsers) {
    // Check if exchange exists
    const { rows: existing } = await pool.query(
      `SELECT id FROM "ContactExchange" 
       WHERE ("giverId" = $1 AND "receiverId" = $2 AND "eventId" = $3) 
          OR ("giverId" = $2 AND "receiverId" = $1 AND "eventId" = $3)`,
      [userId, otherUser.id, eventId]
    )
    
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO "ContactExchange" (id, "giverId", "receiverId", "eventId", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
        [userId, otherUser.id, eventId]
      )
      
      // Also create reverse exchange (mutual)
      await pool.query(
        `INSERT INTO "ContactExchange" (id, "giverId", "receiverId", "eventId", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
        [otherUser.id, userId, eventId]
      )
      
      exchangeCount++
    }
  }
  console.log(`  ✅ Exchanged contacts with ${exchangeCount} attendees`)
}

async function seedMessages(userId: string) {
  console.log('💬 Seeding messages...')
  
  // Get some users to message
  const { rows: otherUsers } = await pool.query(
    `SELECT id, name FROM "User" WHERE id != $1 ORDER BY random() LIMIT 5`,
    [userId]
  )
  
  const eventId = await getEventId()
  
  const conversationStarters = [
    ["Assalamu alaikum! Great to meet you at the conference.", "Wa alaikum assalam! Yes, the keynote was amazing!"],
    ["Did you attend the workshop on community building?", "Yes! The practical tips were very helpful."],
    ["Would you like to connect after the event?", "Definitely! Let's exchange contacts."],
    ["What did you think of today's sessions?", "Very insightful, especially the panel discussion."],
    ["Are you coming to tomorrow's morning session?", "InshAllah, I'll be there early."],
  ]
  
  let threadCount = 0
  for (let i = 0; i < otherUsers.length; i++) {
    const otherUser = otherUsers[i]
    const conversation = conversationStarters[i]
    
    // Check if thread exists
    const { rows: existingThread } = await pool.query(
      `SELECT id FROM "MessageThread" 
       WHERE ("creatorId" = $1 AND "participantId" = $2)
          OR ("creatorId" = $2 AND "participantId" = $1)`,
      [userId, otherUser.id]
    )
    
    if (existingThread.length === 0) {
      // Create thread
      const { rows: thread } = await pool.query(
        `INSERT INTO "MessageThread" (id, "creatorId", "participantId", "eventId", "lastMessageAt", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
         RETURNING id`,
        [userId, otherUser.id, eventId]
      )
      
      // Add messages
      for (let j = 0; j < conversation.length; j++) {
        const senderId = j % 2 === 0 ? userId : otherUser.id
        await pool.query(
          `INSERT INTO "Message" (id, "threadId", "senderId", content, "isRead", "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() - interval '${j} minutes')`,
          [thread[0].id, senderId, conversation[j], true]
        )
      }
      
      threadCount++
    }
  }
  console.log(`  ✅ Created ${threadCount} message threads`)
}

async function seedFollows(userId: string) {
  console.log('👥 Seeding follows...')
  
  // Get some users to follow
  const { rows: otherUsers } = await pool.query(
    `SELECT id, name FROM "User" WHERE id != $1 ORDER BY random() LIMIT 12`,
    [userId]
  )
  
  let followCount = 0
  for (const otherUser of otherUsers) {
    // Check if follow exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM "Follow" WHERE "followerId" = $1 AND "followingId" = $2',
      [userId, otherUser.id]
    )
    
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO "Follow" (id, "followerId", "followingId")
         VALUES (gen_random_uuid(), $1, $2)`,
        [userId, otherUser.id]
      )
      followCount++
    }
  }
  console.log(`  ✅ Following ${followCount} users`)
}

async function seedGamificationPoints(userId: string, eventId: string) {
  console.log('🏆 Seeding gamification points...')
  
  const pointActions = [
    { action: 'session_attendance', points: 10 },
    { action: 'session_attendance', points: 10 },
    { action: 'poll_vote', points: 5 },
    { action: 'contact_exchange', points: 15 },
    { action: 'photo_upload', points: 10 },
    { action: 'question_asked', points: 20 },
    { action: 'profile_complete', points: 25 },
    { action: 'early_checkin', points: 30 },
  ]
  
  let pointsAdded = 0
  for (const action of pointActions) {
    await pool.query(
      `INSERT INTO "GamificationPoint" (id, "userId", "eventId", action, points, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() - interval '${Math.floor(Math.random() * 48)} hours')`,
      [userId, eventId, action.action, action.points]
    )
    pointsAdded += action.points
  }
  console.log(`  ✅ Awarded ${pointsAdded} total points across ${pointActions.length} actions`)
}

async function seedNotifications(userId: string) {
  console.log('🔔 Seeding notifications...')
  
  const notifications = [
    { type: 'announcement', title: 'Welcome to MASCON 2025!', content: 'We are excited to have you join us.' },
    { type: 'session_reminder', title: 'Session Starting Soon', content: 'The keynote with Dr. Yasir Qadhi starts in 15 minutes.' },
    { type: 'message', title: 'New Message', content: 'You have a new message from Ahmad Hassan.' },
    { type: 'poll', title: 'New Poll Available', content: 'Share your opinion on session topics.' },
    { type: 'contact', title: 'Contact Exchange', content: 'Sarah Ahmed shared their contact with you.' },
  ]
  
  for (const notif of notifications) {
    await pool.query(
      `INSERT INTO "Notification" (id, "userId", type, title, content, "isRead", "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW() - interval '${Math.floor(Math.random() * 24)} hours')`,
      [userId, notif.type, notif.title, notif.content, Math.random() > 0.5]
    )
  }
  console.log(`  ✅ Created ${notifications.length} notifications`)
}

async function main() {
  console.log('🌟 Seeding user interactions...\n')
  
  try {
    const eventId = await getEventId()
    if (!eventId) {
      throw new Error('No event found in database')
    }
    
    // Create or update test user
    const userId = await createOrUpdateTestUser()
    console.log('')
    
    // Create event role
    await createEventRole(userId, eventId)
    console.log('')
    
    // Seed all interactions
    await seedMyAgendaItems(userId)
    console.log('')
    
    await seedPollVotes(userId)
    console.log('')
    
    await seedNotes(userId)
    console.log('')
    
    await seedQAQuestions(userId)
    console.log('')
    
    await seedContactExchanges(userId, eventId)
    console.log('')
    
    await seedMessages(userId)
    console.log('')
    
    await seedFollows(userId)
    console.log('')
    
    await seedGamificationPoints(userId, eventId)
    console.log('')
    
    await seedNotifications(userId)
    
    console.log('\n✅ All user interactions seeded successfully!')
    console.log(`\n📧 Login with: ${TEST_USER.email}`)
    
  } catch (error) {
    console.error('❌ Error seeding interactions:', error)
    throw error
  } finally {
    await pool.end()
  }
}

main()
