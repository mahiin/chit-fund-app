import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getSessionFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if user is admin or superadmin
    const session = getSessionFromRequest(request);
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, name, email, role } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate role - only superadmin can create superadmin users
    let userRole: 'superadmin' | 'admin' | 'user' = 'user';
    if (role === 'superadmin') {
      if (session.role !== 'superadmin') {
        return NextResponse.json(
          { error: 'Unauthorized - Only Super Admin can create Super Admin users' },
          { status: 403 }
        );
      }
      userRole = 'superadmin';
    } else if (role === 'admin') {
      // Admin and superadmin can create admin users
      userRole = 'admin';
    } else {
      userRole = 'user';
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      name,
      email: email || '',
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

