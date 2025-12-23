'use client';

import { useState, useEffect } from 'react';
import AddMembersToChitSet from './AddMembersToChitSet';

interface Member {
  _id: string;
  name: string;
  memberId: string;
  mobile: string;
  email: string;
  location: string;
}

interface ChitSetMembersProps {
  setId: string;
  setName: string;
  onClose: () => void;
}

export default function ChitSetMembers({ setId, setName, onClose }: ChitSetMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<{
    memberId: string;
    memberName: string;
    otherChitSets: Array<{ id: string; name: string }>;
  } | null>(null);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/sets/${setId}/members`);
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

  const handleRemoveClick = async (memberId: string, memberName: string) => {
    // First check if member is in other chit sets
    try {
      const response = await fetch(`/api/sets/${setId}/members?memberId=${memberId}&checkOnly=true`);
      const data = await response.json();
      
      if (data.success && data.otherChitSets && data.otherChitSets.length > 0) {
        // Show confirmation dialog with option to remove from all or just this one
        setRemoveConfirm({
          memberId,
          memberName,
          otherChitSets: data.otherChitSets,
        });
      } else {
        // No other chit sets, proceed with removal
        await removeMember(memberId, false);
      }
    } catch (error) {
      console.error('Error checking other chit sets:', error);
      // Proceed with removal anyway
      await removeMember(memberId, false);
    }
  };

  const removeMember = async (memberId: string, removeFromAll: boolean) => {
    setRemovingMemberId(memberId);
    try {
      const response = await fetch(
        `/api/sets/${setId}/members?memberId=${memberId}&removeFromAll=${removeFromAll}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      
      if (data.success) {
        setMembers(members.filter(m => m._id !== memberId));
        setRemoveConfirm(null);
        // Refresh parent component if needed
        window.dispatchEvent(new Event('chitset-updated'));
      } else {
        alert(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.mobile.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-blue-200">
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-white">{setName}</h2>
              <p className="text-sm text-blue-100 mt-1">
                <span className="font-semibold">{members.length}</span> active members
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddMembers(true)}
                className="px-5 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                ➕ Add Members
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 text-3xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 bg-white/80 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search by name, member ID, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-blue-50/30">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No members found matching your search' : 'No members in this chit set'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member, index) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-lg border-2 border-transparent hover:border-blue-200 transition-all duration-200 transform hover:-translate-y-1"
                    style={{
                      background: index % 2 === 0 
                        ? 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' 
                        : 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)'
                    }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{member.name}</div>
                        <div className="text-sm text-gray-600 font-medium">
                          🆔 {member.memberId} • 📱 {member.mobile}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">📍 {member.location}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveClick(member._id, member.name)}
                      disabled={removingMemberId === member._id}
                      className="ml-4 px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-semibold"
                    >
                      {removingMemberId === member._id ? '⏳ Removing...' : '🗑️ Remove'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Remove Member from Chit Set?
              </h3>
            </div>
            <p className="text-gray-700 mb-4 text-center">
              <strong className="text-red-600">{removeConfirm.memberName}</strong> is also a member of:
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
              <ul className="space-y-2">
                {removeConfirm.otherChitSets.map(set => (
                  <li key={set.id} className="text-sm text-gray-700 font-medium flex items-center">
                    <span className="text-yellow-600 mr-2">📋</span>
                    {set.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => removeMember(removeConfirm.memberId, true)}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                🗑️ Remove from All
              </button>
              <button
                onClick={() => removeMember(removeConfirm.memberId, false)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                ✂️ Remove from This Only
              </button>
              <button
                onClick={() => setRemoveConfirm(null)}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-200"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      {showAddMembers && (
        <AddMembersToChitSet
          setId={setId}
          setName={setName}
          onClose={() => setShowAddMembers(false)}
          onSuccess={() => {
            fetchMembers();
            setShowAddMembers(false);
          }}
        />
      )}
    </>
  );
}

