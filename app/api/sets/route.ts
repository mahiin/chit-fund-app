import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import ChitSet from '@/models/ChitSet';
// Import Member model - must be imported before populate
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectDB();
    
    // Ensure Member model is registered (critical for serverless/Vercel)
    // Access the model to ensure it's registered after connection
    // This handles cases where the model wasn't registered due to module caching
    if (!mongoose.models.Member) {
      // Force registration by accessing the imported model
      // The Member import should have registered it, but verify
      const _ = Member; // Access to ensure registration
    }

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


