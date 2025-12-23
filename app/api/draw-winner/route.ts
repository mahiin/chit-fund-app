import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChitSet from '@/models/ChitSet';
import Member from '@/models/Member';

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { setId } = body;

    if (!setId) {
      return NextResponse.json(
        { error: 'Set ID is required' },
        { status: 400 }
      );
    }

    const chitSet = await ChitSet.findById(setId).populate('activeMembers');

    if (!chitSet) {
      return NextResponse.json(
        { error: 'Chit set not found' },
        { status: 404 }
      );
    }

    if (chitSet.activeMembers.length < 3) {
      return NextResponse.json(
        { error: 'Not enough active members to draw winners' },
        { status: 400 }
      );
    }

    // Pick 3 random members
    const shuffled = [...chitSet.activeMembers].sort(() => 0.5 - Math.random());
    const winners = shuffled.slice(0, 3);

    // Calculate winner amount: Each winner gets 25% of total collection
    const totalCollection = chitSet.totalMembers * chitSet.monthlyAmount;
    const eachWinnerAmount = totalCollection / 4; // 25% per winner

    // Get member details
    const winnerDetails = await Promise.all(
      winners.map(async (winner: any) => {
        const member = await Member.findById(winner._id || winner);
        return {
          memberId: member?.memberId || '',
          memberName: member?.name || '',
          dateWon: new Date(),
          amount: Math.round(eachWinnerAmount), // 25% of total collection
        };
      })
    );

    // Update chit set: move winners to history and remove from active
    const winnerIds = winners.map((w: any) => w._id || w);
    
    chitSet.winnerHistory.push(...winnerDetails);
    chitSet.activeMembers = chitSet.activeMembers.filter(
      (memberId: any) => !winnerIds.includes(memberId._id || memberId)
    );

    await chitSet.save();

    return NextResponse.json({
      success: true,
      winners: winnerDetails,
      remainingMembers: chitSet.activeMembers.length,
    });
  } catch (error: any) {
    console.error('Draw winner error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to draw winners' },
      { status: 500 }
    );
  }
}


