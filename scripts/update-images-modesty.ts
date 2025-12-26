import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Placeholder images that are modest - using abstract/icon based images
const MODEST_PLACEHOLDER_IMAGES = {
  // For speakers - use abstract geometric patterns or mosque silhouettes
  maleSpeaker: 'https://api.dicebear.com/7.x/initials/svg?seed=',
  femaleSpeakerHijabi: 'https://api.dicebear.com/7.x/initials/svg?seed=',
  // Generic user avatars - abstract initials
  maleUser: 'https://api.dicebear.com/7.x/initials/svg?seed=',
  femaleUser: 'https://api.dicebear.com/7.x/initials/svg?seed=',
  // Company logos - use abstract patterns
  company: 'https://api.dicebear.com/7.x/shapes/svg?seed=',
}

// Names that are typically female (non-hijabi images would be problematic)
const FEMALE_FIRST_NAMES = [
  'yasmin', 'fatima', 'aisha', 'maryam', 'khadijah', 'safiya', 'layla', 
  'nadia', 'amira', 'sara', 'hana', 'zainab', 'aaliyah', 'samira',
  'jessica', 'jennifer', 'sarah', 'emily', 'rachel', 'michelle', 'lisa',
  'mary', 'patricia', 'linda', 'elizabeth', 'barbara', 'susan', 'margaret'
]

function isLikelyFemale(name: string): boolean {
  if (!name) return false
  const firstName = name.toLowerCase().split(' ')[0]
  return FEMALE_FIRST_NAMES.some(fn => firstName.includes(fn))
}

async function updateSpeakerImages() {
  console.log('📷 Updating speaker images for modesty...')
  
  const { rows: speakers } = await pool.query('SELECT id, name, "imageUrl" FROM "Speaker"')
  
  for (const speaker of speakers) {
    // Replace with initials-based avatar for all speakers
    const newImageUrl = `${MODEST_PLACEHOLDER_IMAGES.maleSpeaker}${encodeURIComponent(speaker.name)}&backgroundColor=059669&color=ffffff`
    
    await pool.query(
      'UPDATE "Speaker" SET "imageUrl" = $1 WHERE id = $2',
      [newImageUrl, speaker.id]
    )
    console.log(`  ✅ Updated speaker: ${speaker.name}`)
  }
}

async function updateUserImages() {
  console.log('👤 Updating user images for modesty...')
  
  const { rows: users } = await pool.query('SELECT id, name, image FROM "User" WHERE image IS NOT NULL')
  
  for (const user of users) {
    // Use initials-based avatars for all users
    const name = user.name || 'User'
    const newImageUrl = `${MODEST_PLACEHOLDER_IMAGES.maleUser}${encodeURIComponent(name)}&backgroundColor=0891b2&color=ffffff`
    
    await pool.query(
      'UPDATE "User" SET image = $1 WHERE id = $2',
      [newImageUrl, user.id]
    )
    console.log(`  ✅ Updated user: ${name}`)
  }
}

async function updateExhibitorLogos() {
  console.log('🏢 Updating exhibitor logos...')
  
  const { rows: exhibitors } = await pool.query('SELECT id, name, "logoUrl" FROM "Exhibitor"')
  
  for (const exhibitor of exhibitors) {
    // Use abstract shape-based logos instead of photos
    const newLogoUrl = `${MODEST_PLACEHOLDER_IMAGES.company}${encodeURIComponent(exhibitor.name)}&backgroundColor=1e293b`
    
    await pool.query(
      'UPDATE "Exhibitor" SET "logoUrl" = $1 WHERE id = $2',
      [newLogoUrl, exhibitor.id]
    )
    console.log(`  ✅ Updated exhibitor: ${exhibitor.name}`)
  }
}

async function updateSponsorLogos() {
  console.log('🎖️ Updating sponsor logos...')
  
  const { rows: sponsors } = await pool.query('SELECT id, name, "logoUrl" FROM "Sponsor"')
  
  for (const sponsor of sponsors) {
    // Use abstract shape-based logos
    const newLogoUrl = `${MODEST_PLACEHOLDER_IMAGES.company}${encodeURIComponent(sponsor.name)}&backgroundColor=7c3aed`
    
    await pool.query(
      'UPDATE "Sponsor" SET "logoUrl" = $1 WHERE id = $2',
      [newLogoUrl, sponsor.id]
    )
    console.log(`  ✅ Updated sponsor: ${sponsor.name}`)
  }
}

async function main() {
  console.log('🌙 Updating images for modesty standards...\n')
  
  try {
    await updateSpeakerImages()
    console.log('')
    await updateUserImages()
    console.log('')
    await updateExhibitorLogos()
    console.log('')
    await updateSponsorLogos()
    
    console.log('\n✅ All images updated successfully!')
  } catch (error) {
    console.error('❌ Error updating images:', error)
    throw error
  } finally {
    await pool.end()
  }
}

main()
