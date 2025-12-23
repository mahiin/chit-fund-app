'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Member {
  _id: string;
  memberId: string;
  name: string;
}

export default function CreateSampleSetsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; sets?: any[] } | null>(null);

  const createSampleSets = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Create the 3 chit sets without members (members will be added via bulk upload)
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

      const createdSets = [];

      for (const config of chitSetsConfig) {
        // Create sets without members - members will be added via bulk upload
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
            activeMemberIds: [], // Empty - members will be added later
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          createdSets.push(data.set);
        } else {
          console.error(`Failed to create ${config.name}:`, data.error);
        }
      }

      setResult({
        success: true,
        message: `Successfully created ${createdSets.length} chit sets. Now upload members and assign them to these sets via the Upload Members page.`,
        sets: createdSets,
      });
    } catch (error: any) {
      console.error('Error creating chit sets:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to create chit sets',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Chit Sets</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Workflow</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Step-by-Step Process:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li><strong>Step 1:</strong> Create chit sets first (using the form below or the button to create 3 sample sets)</li>
              <li><strong>Step 2:</strong> Upload members via CSV file</li>
              <li><strong>Step 3:</strong> During upload, select which chit sets to add members to</li>
            </ol>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Create: 3 Sample Sets</h2>
          <p className="text-gray-600 mb-4">
            Click the button below to quickly create 3 pre-configured chit sets. You can add members to them later via bulk upload.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Sets to be created:</h3>
            <ul className="space-y-1 text-blue-800">
              <li>• 1L_200_Member_20th_every_Month (₹1,00,000, Draw on 20th)</li>
              <li>• 10K_200_Member_1st_everyMonth (₹10,000, Draw on 1st)</li>
              <li>• 50K_200_Member_24th_everyMonth (₹50,000, Draw on 24th)</li>
            </ul>
            <p className="text-sm text-blue-700 mt-3 font-medium">
              💡 These sets will be created empty. Add members via bulk upload and select these sets during upload.
            </p>
          </div>

          <button
            onClick={createSampleSets}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? 'Creating Sets...' : 'Create All 3 Chit Sets'}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Or create custom chit sets:</p>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Management Tab →
            </a>
          </div>
        </div>

        {result && (
          <div className={`bg-white rounded-lg shadow-md p-6 ${
            result.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅ Success' : '❌ Error'}
            </h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </p>
            {result.sets && result.sets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Created Sets:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {result.sets.map((set: any) => (
                    <li key={set._id}>{set.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

