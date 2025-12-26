import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function getEventId(): Promise<string> {
  const { rows } = await pool.query('SELECT id FROM "Event" LIMIT 1')
  return rows[0]?.id
}

async function seedQAQuestionsFromMultipleUsers() {
  console.log('❓ Seeding Q&A questions from multiple users...')
  
  // Get users
  const { rows: users } = await pool.query(
    `SELECT id, name FROM "User" ORDER BY random() LIMIT 20`
  )
  
  // Get sessions
  const { rows: sessions } = await pool.query(
    `SELECT id, title FROM "EventSession" 
     WHERE "sessionType" IN ('keynote', 'panel', 'workshop') 
     ORDER BY "startTime"`
  )
  
  const questionTemplates = [
    "How can we apply this teaching in our daily lives?",
    "What are the biggest challenges facing Muslims in the West today?",
    "Can you recommend any books for further study on this topic?",
    "How do we balance career ambitions with spiritual growth?",
    "What advice would you give to young Muslims struggling with identity?",
    "How should we approach difficult family situations while maintaining patience?",
    "What role should community organizations play in supporting youth?",
    "How do we navigate social media while protecting our faith?",
    "What are the best ways to maintain consistency in worship?",
    "How can we contribute to positive change in our communities?",
    "What does the Quran teach us about dealing with adversity?",
    "How do we explain Islamic values to non-Muslim colleagues?",
    "What steps can we take to improve our khushu in prayer?",
    "How should we prioritize between different acts of worship?",
    "What are the etiquettes of seeking knowledge in Islam?",
    "How do we maintain family ties when relatives are far away?",
    "What is the proper way to give naseeha (advice)?",
    "How can we raise children with strong Islamic values?",
    "What are the signs of a sincere heart?",
    "How do we deal with burnout while serving the community?",
  ]
  
  // Clear existing Q&A questions
  await pool.query('DELETE FROM "QAVote"')
  await pool.query('DELETE FROM "QAQuestion"')
  
  let questionCount = 0
  for (const session of sessions) {
    // Add 3-5 questions per session from random users
    const numQuestions = Math.floor(Math.random() * 3) + 3
    
    for (let i = 0; i < numQuestions && questionCount < questionTemplates.length * 2; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const question = questionTemplates[Math.floor(Math.random() * questionTemplates.length)]
      const votesCount = Math.floor(Math.random() * 25)
      
      await pool.query(
        `INSERT INTO "QAQuestion" (id, "sessionId", "userId", content, "isAnonymous", "isAnswered", "votesCount", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW() - interval '${Math.floor(Math.random() * 120)} minutes')`,
        [session.id, randomUser.id, question, Math.random() > 0.7, Math.random() > 0.8, votesCount]
      )
      questionCount++
    }
  }
  console.log(`  ✅ Created ${questionCount} Q&A questions across sessions`)
}

async function seedMorePollVotes() {
  console.log('🗳️ Seeding poll votes from multiple users...')
  
  // Get users
  const { rows: users } = await pool.query(
    `SELECT id FROM "User" ORDER BY random() LIMIT 30`
  )
  
  // Get poll options
  const { rows: options } = await pool.query(
    `SELECT id, "pollId" FROM "PollOption"`
  )
  
  // Group options by poll
  const pollOptions = new Map<string, string[]>()
  for (const opt of options) {
    if (!pollOptions.has(opt.pollId)) {
      pollOptions.set(opt.pollId, [])
    }
    pollOptions.get(opt.pollId)!.push(opt.id)
  }
  
  let voteCount = 0
  for (const user of users) {
    // Each user votes on some polls
    for (const [pollId, optIds] of pollOptions) {
      if (Math.random() > 0.3) { // 70% chance to vote
        const randomOptionId = optIds[Math.floor(Math.random() * optIds.length)]
        
        // Check if already voted
        const { rows: existing } = await pool.query(
          'SELECT id FROM "PollVote" WHERE "optionId" = $1 AND "userId" = $2',
          [randomOptionId, user.id]
        )
        
        if (existing.length === 0) {
          try {
            await pool.query(
              `INSERT INTO "PollVote" (id, "optionId", "userId")
               VALUES (gen_random_uuid(), $1, $2)`,
              [randomOptionId, user.id]
            )
            
            // Increment vote count
            await pool.query(
              'UPDATE "PollOption" SET "votesCount" = "votesCount" + 1 WHERE id = $1',
              [randomOptionId]
            )
            voteCount++
          } catch (e) {
            // Ignore duplicate key errors
          }
        }
      }
    }
  }
  console.log(`  ✅ Added ${voteCount} poll votes`)
}

async function seedMoreAgendaItems() {
  console.log('📅 Seeding agenda favorites from multiple users...')
  
  const { rows: users } = await pool.query(
    `SELECT id FROM "User" ORDER BY random() LIMIT 25`
  )
  
  const { rows: sessions } = await pool.query(
    `SELECT id, "eventId" FROM "EventSession"`
  )
  
  let addedCount = 0
  for (const user of users) {
    // Each user favorites 5-10 sessions
    const numFavorites = Math.floor(Math.random() * 6) + 5
    const shuffled = sessions.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < numFavorites && i < shuffled.length; i++) {
      const session = shuffled[i]
      
      // Check if already added
      const { rows: existing } = await pool.query(
        'SELECT id FROM "MyAgendaItem" WHERE "userId" = $1 AND "sessionId" = $2',
        [user.id, session.id]
      )
      
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO "MyAgendaItem" (id, "userId", "sessionId", "eventId", "isCustom", "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())`,
          [user.id, session.id, session.eventId]
        )
        addedCount++
      }
    }
  }
  console.log(`  ✅ Added ${addedCount} agenda favorites`)
}

async function seedMoreNotes() {
  console.log('📝 Seeding notes from multiple users...')
  
  const { rows: users } = await pool.query(
    `SELECT id FROM "User" ORDER BY random() LIMIT 15`
  )
  
  const { rows: sessions } = await pool.query(
    `SELECT id FROM "EventSession" ORDER BY random() LIMIT 20`
  )
  
  const noteTemplates = [
    "Very insightful session. Key point: focus on quality over quantity.",
    "Need to implement the 3 steps mentioned: reflect, plan, act.",
    "Reminder to myself: consistency is better than intensity.",
    "Great quotes from this session - need to review the slides later.",
    "Action item: Start with small changes and build from there.",
    "The story about the companion was very moving.",
    "Important hadith mentioned - need to memorize this.",
    "Practical tip: Set specific goals with deadlines.",
    "This connects well with what we learned yesterday.",
    "Follow up: Research the books recommended by the speaker.",
    "Key takeaway: Don't underestimate the power of dua.",
    "Note to self: Share these insights with family.",
    "The framework presented was very helpful for understanding.",
    "Question to ask: How to apply this in a work setting?",
    "Beautifully explained - the metaphor really helped clarify.",
  ]
  
  let noteCount = 0
  for (const user of users) {
    // Each user takes notes on 3-6 sessions
    const numNotes = Math.floor(Math.random() * 4) + 3
    const shuffled = sessions.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < numNotes && i < shuffled.length; i++) {
      const session = shuffled[i]
      const note = noteTemplates[Math.floor(Math.random() * noteTemplates.length)]
      
      // Check if already exists
      const { rows: existing } = await pool.query(
        'SELECT id FROM "Note" WHERE "userId" = $1 AND "sessionId" = $2',
        [user.id, session.id]
      )
      
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO "Note" (id, "userId", "sessionId", content, "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())`,
          [user.id, session.id, note]
        )
        noteCount++
      }
    }
  }
  console.log(`  ✅ Created ${noteCount} session notes`)
}

async function seedMoreMessages() {
  console.log('💬 Seeding messages between users...')
  
  const { rows: users } = await pool.query(
    `SELECT id, name FROM "User" ORDER BY random() LIMIT 20`
  )
  
  const eventId = await getEventId()
  
  const messageTemplates = [
    ["Assalamu alaikum! Are you attending the keynote tomorrow?", "Wa alaikum assalam! Yes, InshAllah. See you there!"],
    ["JazakAllah khair for the notes you shared!", "Wa iyyakum! Happy to help."],
    ["Subhanallah, what an amazing session that was!", "Truly inspiring. The speaker was excellent."],
    ["Would you like to grab coffee during the break?", "Sounds good! Let's meet at the cafe area."],
    ["Did you get the speaker's book recommendation?", "Yes! 'Purification of the Heart' - adding to my list."],
    ["MashaAllah, great question you asked!", "Alhamdulillah, I was nervous but glad I asked."],
    ["Can you share your notes from the workshop?", "Of course! I'll send them after the session."],
    ["What did you think of the panel discussion?", "Very balanced perspectives. Learned a lot."],
  ]
  
  let threadCount = 0
  for (let i = 0; i < users.length - 1; i += 2) {
    const user1 = users[i]
    const user2 = users[i + 1]
    const conversation = messageTemplates[Math.floor(Math.random() * messageTemplates.length)]
    
    // Check if thread exists
    const { rows: existingThread } = await pool.query(
      `SELECT id FROM "MessageThread" 
       WHERE ("creatorId" = $1 AND "participantId" = $2)
          OR ("creatorId" = $2 AND "participantId" = $1)`,
      [user1.id, user2.id]
    )
    
    if (existingThread.length === 0) {
      // Create thread
      const { rows: thread } = await pool.query(
        `INSERT INTO "MessageThread" (id, "creatorId", "participantId", "eventId", "lastMessageAt", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
         RETURNING id`,
        [user1.id, user2.id, eventId]
      )
      
      // Add messages
      for (let j = 0; j < conversation.length; j++) {
        const senderId = j % 2 === 0 ? user1.id : user2.id
        await pool.query(
          `INSERT INTO "Message" (id, "threadId", "senderId", content, "isRead", "createdAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() - interval '${(conversation.length - j) * 5} minutes')`,
          [thread[0].id, senderId, conversation[j], true]
        )
      }
      
      threadCount++
    }
  }
  console.log(`  ✅ Created ${threadCount} message threads`)
}

async function seedGamificationForMultipleUsers() {
  console.log('🏆 Seeding gamification points for multiple users...')
  
  const { rows: users } = await pool.query(
    `SELECT id FROM "User" ORDER BY random() LIMIT 30`
  )
  
  const eventId = await getEventId()
  
  const actions = ['session_attendance', 'poll_vote', 'contact_exchange', 'photo_upload', 'question_asked', 'profile_complete', 'check_in']
  
  let totalPoints = 0
  for (const user of users) {
    // Each user gets 3-8 point actions
    const numActions = Math.floor(Math.random() * 6) + 3
    
    for (let i = 0; i < numActions; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)]
      const points = Math.floor(Math.random() * 20) + 5
      
      await pool.query(
        `INSERT INTO "GamificationPoint" (id, "userId", "eventId", action, points, "createdAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW() - interval '${Math.floor(Math.random() * 72)} hours')`,
        [user.id, eventId, action, points]
      )
      totalPoints += points
    }
  }
  console.log(`  ✅ Awarded ${totalPoints} total points across ${users.length} users`)
}

async function updateSessionStats() {
  console.log('📊 Updating session engagement stats...')
  
  // Update likesCount based on MyAgendaItems
  await pool.query(`
    UPDATE "EventSession" es
    SET "likesCount" = (
      SELECT COUNT(*) FROM "MyAgendaItem" mai WHERE mai."sessionId" = es.id
    )
  `)
  
  // Update commentsCount based on QAQuestions
  await pool.query(`
    UPDATE "EventSession" es
    SET "commentsCount" = (
      SELECT COUNT(*) FROM "QAQuestion" qa WHERE qa."sessionId" = es.id
    )
  `)
  
  console.log('  ✅ Updated session likes and comments counts')
}

async function main() {
  console.log('🌟 Seeding community interactions...\n')
  
  try {
    await seedQAQuestionsFromMultipleUsers()
    console.log('')
    
    await seedMorePollVotes()
    console.log('')
    
    await seedMoreAgendaItems()
    console.log('')
    
    await seedMoreNotes()
    console.log('')
    
    await seedMoreMessages()
    console.log('')
    
    await seedGamificationForMultipleUsers()
    console.log('')
    
    await updateSessionStats()
    
    console.log('\n✅ All community interactions seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding community interactions:', error)
    throw error
  } finally {
    await pool.end()
  }
}

main()
