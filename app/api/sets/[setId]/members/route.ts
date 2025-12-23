import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChitSet from '@/models/ChitSet';
import Member from '@/models/Member';

// GET - Get all members in a chit set
export async function GET(
  request: NextRequest,
  { params }: { params: { setId: string } }
) {
  try {
    await connectDB();

    const chitSet = await ChitSet.findById(params.setId)
      .populate('activeMembers', 'name memberId mobile email location');

    if (!chitSet) {
      return NextResponse.json(
        { error: 'Chit set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      members: chitSet.activeMembers,
    });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST - Add members to a chit set
export async function POST(
  request: NextRequest,
  { params }: { params: { setId: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { memberIds } = body;

    if (!memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'Member IDs array is required' },
        { status: 400 }
      );
    }

    const chitSet = await ChitSet.findById(params.setId);
    if (!chitSet) {
      return NextResponse.json(
        { error: 'Chit set not found' },
        { status: 404 }
      );
    }

    // Add members (using Set to avoid duplicates)
    const existingIds = chitSet.activeMembers.map((id: any) => id.toString());
    const uniqueIds = Array.from(new Set([...existingIds, ...memberIds]));
    chitSet.activeMembers = uniqueIds.map(id => id) as any;

    await chitSet.save();

    return NextResponse.json({
      success: true,
      message: `Added ${memberIds.length} member(s) to chit set`,
      activeMembersCount: chitSet.activeMembers.length,
    });
  } catch (error: any) {
    console.error('Error adding members:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add members' },
      { status: 500 }
    );
  }
}

// DELETE - Remove members from a chit set
export async function DELETE(
  request: NextRequest,
  { params }: { params: { setId: string } }
) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');
    const removeFromAll = searchParams.get('removeFromAll') === 'true';
    const checkOnly = searchParams.get('checkOnly') === 'true';

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const chitSet = await ChitSet.findById(params.setId);
    if (!chitSet) {
      return NextResponse.json(
        { error: 'Chit set not found' },
        { status: 404 }
      );
    }

    // Check if member is in other chit sets
    const otherSets = await ChitSet.find({
      _id: { $ne: params.setId },
      activeMembers: memberId,
    });

    // If just checking, return the other sets info
    if (checkOnly) {
      return NextResponse.json({
        success: true,
        otherChitSets: otherSets.map(s => ({ id: s._id, name: s.name })),
      });
    }

    if (removeFromAll && otherSets.length > 0) {
      // Remove from all chit sets
      await ChitSet.updateMany(
        { activeMembers: memberId },
        { $pull: { activeMembers: memberId } }
      );
    } else {
      // Remove only from this chit set
      chitSet.activeMembers = chitSet.activeMembers.filter(
        (id: any) => id.toString() !== memberId
      );
      await chitSet.save();
    }

    return NextResponse.json({
      success: true,
      message: removeFromAll
        ? `Removed member from all ${otherSets.length + 1} chit set(s)`
        : 'Removed member from this chit set',
      otherChitSets: otherSets.map(s => ({ id: s._id, name: s.name })),
    });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}

