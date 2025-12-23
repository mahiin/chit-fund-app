'use client';

import { useState } from 'react';

interface Member {
  _id: string;
  name: string;
  memberId: string;
}

export default function CreateChitSet({ members, onSuccess }: { members: Member[]; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    totalMembers: 200,
    drawDate: 24,
    monthlyAmount: 50000,
    selectedMemberIds: [] as string[],
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          totalMembers: formData.totalMembers,
          drawDate: formData.drawDate,
          monthlyAmount: formData.monthlyAmount,
          activeMemberIds: formData.selectedMemberIds,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Chit set created successfully!');
        setFormData({
          name: '',
          totalMembers: 200,
          drawDate: 24,
          monthlyAmount: 50000,
          selectedMemberIds: [],
        });
        onSuccess();
      } else {
        alert(data.error || 'Failed to create chit set');
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create chit set');
    } finally {
      setCreating(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMemberIds: prev.selectedMemberIds.includes(memberId)
        ? prev.selectedMemberIds.filter(id => id !== memberId)
        : [...prev.selectedMemberIds, memberId],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Chit Fund Group</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., 50K Group"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Members
            </label>
            <input
              type="number"
              value={formData.totalMembers}
              onChange={(e) => setFormData({ ...formData, totalMembers: parseInt(e.target.value) })}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Draw Date (Day of Month)
            </label>
            <input
              type="number"
              value={formData.drawDate}
              onChange={(e) => setFormData({ ...formData, drawDate: parseInt(e.target.value) })}
              required
              min="1"
              max="31"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Amount (₹)
          </label>
          <input
            type="number"
            value={formData.monthlyAmount}
            onChange={(e) => setFormData({ ...formData, monthlyAmount: parseInt(e.target.value) })}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Active Members (Optional - {formData.selectedMemberIds.length} selected)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            You can create the chit set now and add members later via bulk upload
          </p>
          <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto">
            {members.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No members available. You can create the chit set now and add members later via bulk upload.
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <label key={member._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.selectedMemberIds.includes(member._id)}
                      onChange={() => toggleMember(member._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {member.name} ({member.memberId})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={creating || !formData.name}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : 'Create Chit Fund Group'}
        </button>
      </form>
    </div>
  );
}

