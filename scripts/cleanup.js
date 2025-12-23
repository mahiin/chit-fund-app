/**
 * Database Cleanup Script
 * 
 * This script can be run directly with Node.js to clean the database
 * 
 * Usage:
 *   node scripts/cleanup.js [type]
 * 
 * Types:
 *   - all (default): Delete all members and chit sets
 *   - members: Delete only members
 *   - sets: Delete only chit sets
 * 
 * Example:
 *   node scripts/cleanup.js all
 *   node scripts/cleanup.js members
 *   node scripts/cleanup.js sets
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define schemas (simplified versions)
const MemberSchema = new mongoose.Schema({}, { strict: false });
const ChitSetSchema = new mongoose.Schema({}, { strict: false });

const Member = mongoose.models.Member || mongoose.model('Member', MemberSchema);
const ChitSet = mongoose.models.ChitSet || mongoose.model('ChitSet', ChitSetSchema);

async function cleanup(type = 'all') {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let result = {};

    if (type === 'all' || !type) {
      console.log('🗑️  Deleting all members...');
      const membersResult = await Member.deleteMany({});
      result.membersDeleted = membersResult.deletedCount;
      console.log(`   ✅ Deleted ${membersResult.deletedCount} members`);

      console.log('\n🗑️  Deleting all chit sets...');
      const setsResult = await ChitSet.deleteMany({});
      result.setsDeleted = setsResult.deletedCount;
      console.log(`   ✅ Deleted ${setsResult.deletedCount} chit sets`);

      console.log('\n✅ All data cleaned successfully!');
    } else if (type === 'members') {
      console.log('🗑️  Deleting all members...');
      const membersResult = await Member.deleteMany({});
      result.membersDeleted = membersResult.deletedCount;
      console.log(`   ✅ Deleted ${membersResult.deletedCount} members`);
      console.log('\n✅ All members deleted successfully!');
    } else if (type === 'sets') {
      console.log('🗑️  Deleting all chit sets...');
      const setsResult = await ChitSet.deleteMany({});
      result.setsDeleted = setsResult.deletedCount;
      console.log(`   ✅ Deleted ${setsResult.deletedCount} chit sets`);
      console.log('\n✅ All chit sets deleted successfully!');
    } else {
      console.error('❌ Invalid type. Use: all, members, or sets');
      process.exit(1);
    }

    // Show current counts
    const memberCount = await Member.countDocuments({});
    const setCount = await ChitSet.countDocuments({});
    
    console.log('\n📊 Current Database Status:');
    console.log(`   Members: ${memberCount}`);
    console.log(`   Chit Sets: ${setCount}`);

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get type from command line arguments
const type = process.argv[2] || 'all';

console.log('🧹 Database Cleanup Script\n');
console.log(`Type: ${type}\n`);

cleanup(type);


