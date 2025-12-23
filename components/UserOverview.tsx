'use client';

import { useState, useEffect } from 'react';
import BulkUpload from './BulkUpload';
import CreateChitSet from './CreateChitSet';

interface Member {
  _id: string;
  name: string;
  memberId: string;
}

export default function UserOverview() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
    
    // Listen for updates
    const handleUpdate = () => {
      fetchMembers();
    };
    window.addEventListener('chitset-updated', handleUpdate);
    return () => window.removeEventListener('chitset-updated', handleUpdate);
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">User Management</h2>

      {/* Workflow Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Recommended Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Step 1: Create Chit Sets</h4>
            <p className="text-sm text-blue-700">
              Create chit fund groups first. You can create them empty and add members later.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Step 2: Upload & Assign Members</h4>
            <p className="text-sm text-blue-700">
              Upload CSV file and select which chit sets to add members to during upload.
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Upload and Create Set */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Step 1: Create Chit Sets</h3>
          <CreateChitSet members={members} onSuccess={() => { fetchMembers(); }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Step 2: Upload Members</h3>
          <BulkUpload />
        </div>
      </div>
    </div>
  );
}

