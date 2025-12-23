/**
 * Script to create sample chit fund sets with members
 * Run this after uploading the sample-200-members.csv file
 * 
 * Usage: 
 * 1. Upload members via the UI or API
 * 2. Get the member IDs from the database
 * 3. Run this script to create the 3 chit sets
 */

interface Member {
  _id: string;
  memberId: string;
}

// Configuration for the 3 chit sets
const chitSetsConfig = [
  {
    name: '1L_200_Member_20th_every_Month',
    totalMembers: 200,
    drawDate: 20,
    monthlyAmount: 100000, // 1L = 1 Lakh
  },
  {
    name: '10K_200_Member_1st_everyMonth',
    totalMembers: 200,
    drawDate: 1,
    monthlyAmount: 10000, // 10K
  },
  {
    name: '50K_200_Member_24th_everyMonth',
    totalMembers: 200,
    drawDate: 24,
    monthlyAmount: 50000, // 50K
  },
];

/**
 * This function should be called after members are uploaded
 * It will:
 * 1. Fetch all members from the database
 * 2. Assign first 100 members to all 3 sets (common members)
 * 3. Assign remaining 100 members distributed across sets
 */
export async function createSampleChitSets() {
  try {
    // Step 1: Fetch all members
    const membersResponse = await fetch('/api/members');
    const membersData = await membersResponse.json();
    
    if (!membersData.success || membersData.members.length < 200) {
      throw new Error('Please upload at least 200 members first');
    }

    const allMembers: Member[] = membersData.members;
    
    // Step 2: First 100 members will be in all 3 sets (common members)
    const commonMembers = allMembers.slice(0, 100);
    const commonMemberIds = commonMembers.map(m => m._id);

    // Step 3: Remaining 100 members - distribute them
    const remainingMembers = allMembers.slice(100, 200);
    const remainingMemberIds = remainingMembers.map(m => m._id);

    // Step 4: Create the 3 chit sets
    const createdSets = [];

    for (const config of chitSetsConfig) {
      // Each set gets: 100 common members + 100 unique members = 200 total
      const activeMemberIds = [...commonMemberIds, ...remainingMemberIds];

      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          totalMembers: config.totalMembers,
          drawDate: config.drawDate,
          monthlyAmount: config.monthlyAmount,
          activeMemberIds: activeMemberIds,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        createdSets.push(data.set);
        console.log(`✅ Created: ${config.name}`);
      } else {
        console.error(`❌ Failed to create ${config.name}:`, data.error);
      }
    }

    return {
      success: true,
      message: `Created ${createdSets.length} chit sets`,
      sets: createdSets,
      commonMembersCount: commonMembers.length,
    };
  } catch (error: any) {
    console.error('Error creating chit sets:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// For browser console usage
if (typeof window !== 'undefined') {
  (window as any).createSampleChitSets = createSampleChitSets;
}


