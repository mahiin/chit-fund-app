import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import ChitSet from '@/models/ChitSet';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'all', 'members', 'sets'

    let result: any = {};

    if (type === 'all' || !type) {
      // Delete all members
      const membersResult = await Member.deleteMany({});
      result.membersDeleted = membersResult.deletedCount;

      // Delete all chit sets (this also deletes winner history)
      const setsResult = await ChitSet.deleteMany({});
      result.setsDeleted = setsResult.deletedCount;

      result.message = 'All data cleaned successfully (including winner history)';
    } else if (type === 'members') {
      // Delete only members
      const membersResult = await Member.deleteMany({});
      result.membersDeleted = membersResult.deletedCount;
      result.message = 'All members deleted successfully';
    } else if (type === 'sets') {
      // Delete only chit sets (this also deletes winner history)
      const setsResult = await ChitSet.deleteMany({});
      result.setsDeleted = setsResult.deletedCount;
      result.message = 'All chit sets deleted successfully (including winner history)';
    } else if (type === 'winners') {
      // Clear only winner history from all sets
      const setsResult = await ChitSet.updateMany(
        {},
        { $set: { winnerHistory: [] } }
      );
      result.setsUpdated = setsResult.modifiedCount;
      result.message = 'All winner history cleared successfully';
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use: all, members, or sets' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup data' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current data counts
export async function GET() {
  try {
    await connectDB();

    const memberCount = await Member.countDocuments({});
    const setCount = await ChitSet.countDocuments({});
    const totalWinners = await ChitSet.aggregate([
      { $unwind: '$winnerHistory' },
      { $count: 'total' },
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        members: memberCount,
        chitSets: setCount,
        totalWinners: totalWinners[0]?.total || 0,
      },
    });
  } catch (error: any) {
    console.error('Error getting counts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get counts' },
      { status: 500 }
    );
  }
}

