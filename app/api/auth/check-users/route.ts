import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// This route helps check if users exist in the database
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await User.find({}).select('-password');

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Check users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check users' },
      { status: 500 }
    );
  }
}

