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

    if (chitSet.activeMembers.length < 1) {
      return NextResponse.json(
        { error: 'Not enough active members to draw a winner' },
        { status: 400 }
      );
    }

    // Get previous winner IDs to exclude
    const previousWinnerIds = chitSet.winnerHistory?.map((w: any) => w.memberId) || [];
    
    // Filter out previous winners
    const eligibleMembers = [];
    for (const member of chitSet.activeMembers) {
      let memberDoc = member;
      let memberId = null;
      
      // If member is populated (object with _id), get memberId from it
      if (member && typeof member === 'object' && member.memberId) {
        memberId = member.memberId;
        memberDoc = member;
      } else if (member && typeof member === 'object' && member._id) {
        // If it's an ObjectId reference, we need to fetch it
        const fetchedMember = await Member.findById(member._id || member);
        if (fetchedMember) {
          memberId = fetchedMember.memberId;
          memberDoc = fetchedMember;
        }
      } else if (typeof member === 'string') {
        // If it's just an ID string, fetch the member
        const fetchedMember = await Member.findById(member);
        if (fetchedMember) {
          memberId = fetchedMember.memberId;
          memberDoc = fetchedMember;
        }
      }
      
      if (memberId && !previousWinnerIds.includes(memberId)) {
        eligibleMembers.push(memberDoc);
      }
    }

    if (eligibleMembers.length === 0) {
      return NextResponse.json(
        { error: 'No eligible members (all are previous winners)' },
        { status: 400 }
      );
    }

    // Pick one random member
    const shuffled = [...eligibleMembers].sort(() => 0.5 - Math.random());
    const winner = shuffled[0];

    // Get member details (winner is already a member document)
    const member = winner._id ? winner : await Member.findById(winner);
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const winnerDetail = {
      memberId: member.memberId || '',
      memberName: member.name || '',
      dateWon: new Date(),
      amount: chitSet.monthlyAmount,
    };

    // Update chit set: move winner to history and remove from active
    const winnerId = member._id || winner._id || winner;
    
    chitSet.winnerHistory.push(winnerDetail);
    chitSet.activeMembers = chitSet.activeMembers.filter(
      (memberId: any) => (memberId._id || memberId).toString() !== winnerId.toString()
    );

    await chitSet.save();

    return NextResponse.json({
      success: true,
      winner: winnerDetail,
      remainingMembers: chitSet.activeMembers.length,
    });
  } catch (error: any) {
    console.error('Draw single winner error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to draw winner' },
      { status: 500 }
    );
  }
}

