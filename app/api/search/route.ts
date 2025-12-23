import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChitSet, { IWinnerHistory } from '@/models/ChitSet';
import Member from '@/models/Member';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const mobile = searchParams.get('mobile');
    const memberId = searchParams.get('memberId');

    if (!mobile && !memberId) {
      return NextResponse.json(
        { error: 'Mobile or Member ID is required' },
        { status: 400 }
      );
    }

    // Find member
    let member;
    if (memberId) {
      member = await Member.findOne({ memberId });
    } else if (mobile) {
      member = await Member.findOne({ mobile });
    }

    if (!member) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'Member not found',
      });
    }

    // Search across all chit sets for winner history
    const allSets = await ChitSet.find({});
    const winningHistory: Array<{
      setName: string;
      dateWon: Date;
      amount: number;
    }> = [];

    allSets.forEach((set) => {
      set.winnerHistory.forEach((winner: IWinnerHistory) => {
        if (winner.memberId === member.memberId) {
          winningHistory.push({
            setName: set.name,
            dateWon: winner.dateWon,
            amount: winner.amount,
          });
        }
      });
    });

    return NextResponse.json({
      success: true,
      found: true,
      member: {
        name: member.name,
        memberId: member.memberId,
        mobile: member.mobile,
        email: member.email,
        location: member.location,
      },
      winningHistory,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search member' },
      { status: 500 }
    );
  }
}


