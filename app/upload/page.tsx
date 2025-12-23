'use client';

import Link from 'next/link';
import BulkUpload from '@/components/BulkUpload';

export default function UploadPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bulk Upload Members</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Recommended Workflow:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
            <li><strong>Step 1:</strong> Create chit sets first (go to &quot;Create Sets&quot; page)</li>
            <li><strong>Step 2:</strong> Upload CSV file below</li>
            <li><strong>Step 3:</strong> Select which chit sets to add these members to</li>
            <li><strong>Step 4:</strong> Click &quot;Upload Members&quot;</li>
          </ol>
        </div>
        
        <BulkUpload />
      </div>
    </div>
  );
}

