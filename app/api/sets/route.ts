import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChitSet from '@/models/ChitSet';
// Import Member model to ensure schema is registered before populate
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectDB();

    const sets = await ChitSet.find({})
      .populate('activeMembers', 'name memberId mobile email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      sets,
    });
  } catch (error: any) {
    console.error('Fetch sets error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, totalMembers, drawDate, monthlyAmount, activeMemberIds } = body;

    if (!name || !totalMembers || !drawDate || !monthlyAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chitSet = new ChitSet({
      name,
      totalMembers,
      drawDate,
      monthlyAmount,
      activeMembers: activeMemberIds || [],
      winnerHistory: [],
    });

    await chitSet.save();

    return NextResponse.json({
      success: true,
      set: chitSet,
    });
  } catch (error: any) {
    console.error('Create set error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create set' },
      { status: 500 }
    );
  }
}


