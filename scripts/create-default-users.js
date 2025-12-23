const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createDefaultUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`); // Hide password
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   ID: ${existingAdmin._id}`);
    } else {
      // Create admin user
      console.log('📝 Creating admin user...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        name: 'Administrator',
      });
      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log(`   ID: ${admin._id}`);
    }

    // Check if regular user exists
    const existingUser = await User.findOne({ username: 'user' });
    if (existingUser) {
      console.log('\n⚠️  Regular user already exists');
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   ID: ${existingUser._id}`);
    } else {
      // Create regular user
      console.log('\n📝 Creating regular user...');
      const userPassword = await bcrypt.hash('user123', 10);
      const regularUser = new User({
        username: 'user',
        password: userPassword,
        role: 'user',
        name: 'Regular User',
      });
      await regularUser.save();
      console.log('✅ Regular user created successfully');
      console.log('   Username: user');
      console.log('   Password: user123');
      console.log(`   ID: ${regularUser._id}`);
    }

    // Verify users were created
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    console.log('\n✅ Default users setup complete!');
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating users:');
    console.error('   Message:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('   ⚠️  Could not connect to MongoDB. Please check:');
      console.error('      1. MongoDB URI is correct in .env.local');
      console.error('      2. MongoDB server is running');
      console.error('      3. Network connection is available');
    } else if (error.code === 11000) {
      console.error('   ⚠️  Duplicate key error - user might already exist');
    } else {
      console.error('   Stack:', error.stack);
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

createDefaultUsers();

