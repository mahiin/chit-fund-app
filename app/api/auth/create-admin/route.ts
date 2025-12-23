import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// This route creates the initial admin user
// Should be protected or removed after first admin is created
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { username, password, name, email } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      name,
      email: email || '',
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role,
        name: admin.name,
      },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

