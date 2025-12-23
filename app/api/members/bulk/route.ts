import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import { generateMemberId } from '@/utils/memberIdGenerator';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    
    // Parse CSV
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing error', details: parsed.errors },
        { status: 400 }
      );
    }

    const members = parsed.data as Array<{
      Name?: string;
      Mobile?: string;
      Email?: string;
      Location?: string;
      Aadhar?: string;
    }>;

    // Get existing member IDs
    const existingMembers = await Member.find({}, 'memberId');
    const existingIds = existingMembers.map(m => m.memberId);

    // Create members with generated IDs
    const membersToCreate = members.map((member) => {
      if (!member.Name || !member.Mobile || !member.Email || !member.Location || !member.Aadhar) {
        throw new Error('Missing required fields in CSV');
      }

      return {
        name: member.Name,
        memberId: generateMemberId(existingIds),
        mobile: member.Mobile,
        email: member.Email,
        location: member.Location,
        aadhar: member.Aadhar,
      };
    });

    // Insert all members
    const createdMembers = await Member.insertMany(membersToCreate);

    // Add members to selected chit sets if provided
    const chitSetIdsStr = formData.get('chitSetIds');
    if (chitSetIdsStr) {
      try {
        const chitSetIds = JSON.parse(chitSetIdsStr as string);
        const ChitSet = (await import('@/models/ChitSet')).default;
        
        const memberIds = createdMembers.map(m => m._id);
        
        for (const setId of chitSetIds) {
          await ChitSet.findByIdAndUpdate(
            setId,
            { $addToSet: { activeMembers: { $each: memberIds } } }
          );
        }
      } catch (error) {
        console.error('Error adding members to chit sets:', error);
        // Don't fail the upload if chit set assignment fails
      }
    }

    return NextResponse.json({
      success: true,
      count: createdMembers.length,
      members: createdMembers,
    });
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload members' },
      { status: 500 }
    );
  }
}

