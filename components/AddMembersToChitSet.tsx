'use client';

import { useState, useEffect } from 'react';

interface Member {
  _id: string;
  name: string;
  memberId: string;
  mobile: string;
}

interface AddMembersToChitSetProps {
  setId: string;
  setName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMembersToChitSet({
  setId,
  setName,
  onClose,
  onSuccess,
}: AddMembersToChitSetProps) {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllMembers();
  }, []);

  const fetchAllMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      if (data.success) {
        setAllMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMemberIds.length === 0) {
      alert('Please select at least one member');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch(`/api/sets/${setId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberIds: selectedMemberIds }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully added ${selectedMemberIds.length} member(s) to ${setName}`);
        onSuccess();
        onClose();
      } else {
        alert(data.error || 'Failed to add members');
      }
    } catch (error) {
      console.error('Error adding members:', error);
      alert('Failed to add members');
    } finally {
      setAdding(false);
    }
  };

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.mobile.includes(searchTerm)
  );

  const allFilteredSelected = filteredMembers.length > 0 && 
    filteredMembers.every(member => selectedMemberIds.includes(member._id));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered members
      const filteredIds = filteredMembers.map(m => m._id);
      setSelectedMemberIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered members
      const filteredIds = filteredMembers.map(m => m._id);
      setSelectedMemberIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-green-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">➕ Add Members to {setName}</h2>
            <p className="text-sm text-green-100 mt-1">
              <span className="font-semibold">{selectedMemberIds.length}</span> member(s) selected
              {searchTerm ? ` • ${filteredMembers.length} of ${allMembers.length} shown` : ` • ${allMembers.length} total members`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-green-200 text-3xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Search and Select All */}
        <div className="p-4 bg-white/80 border-b border-gray-200 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search by name, member ID, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>
          {!loading && filteredMembers.length > 0 && (
            <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border-2 border-green-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-2 border-green-500 text-green-600 focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm font-bold text-green-700">
                  ✅ Select All {filteredMembers.length} {searchTerm ? 'filtered' : ''} members
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-green-50/30">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member, index) => (
                <label
                  key={member._id}
                  className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg border-2 ${
                    selectedMemberIds.includes(member._id)
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 shadow-md'
                      : 'bg-white border-transparent hover:border-green-200'
                  }`}
                  style={{
                    background: selectedMemberIds.includes(member._id)
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : index % 2 === 0
                      ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(member._id)}
                    onChange={() => handleToggleMember(member._id)}
                    className="w-5 h-5 rounded border-2 border-green-500 text-green-600 focus:ring-green-500 focus:ring-2 cursor-pointer"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg">{member.name}</div>
                    <div className="text-sm text-gray-600 font-medium">
                      🆔 {member.memberId} • 📱 {member.mobile}
                    </div>
                  </div>
                  {selectedMemberIds.includes(member._id) && (
                    <span className="text-green-600 text-xl">✅</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t bg-white/80">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200"
          >
            ❌ Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={selectedMemberIds.length === 0 || adding}
            className={`px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
              selectedMemberIds.length === 0 || adding
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
            }`}
          >
            {adding ? '⏳ Adding...' : `➕ Add ${selectedMemberIds.length} Member(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

