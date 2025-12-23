'use client';

import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import Link from 'next/link';
import BulkUpload from './BulkUpload';
import CreateChitSet from './CreateChitSet';
import ChitSetMembers from './ChitSetMembers';
import ChitFundCalculation from './ChitFundCalculation';

interface ChitSet {
  _id: string;
  name: string;
  totalMembers: number;
  drawDate: number;
  monthlyAmount: number;
  activeMembers: any[];
  winnerHistory: any[];
}

interface Member {
  _id: string;
  name: string;
  memberId: string;
}

export default function ManagementOverview() {
  const [sets, setSets] = useState<ChitSet[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<ChitSet | null>(null);

  useEffect(() => {
    fetchSets();
    fetchMembers();
    
    // Listen for chit set updates
    const handleUpdate = () => {
      fetchSets();
    };
    window.addEventListener('chitset-updated', handleUpdate);
    return () => window.removeEventListener('chitset-updated', handleUpdate);
  }, []);

  const fetchSets = async () => {
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      if (data.success) {
        setSets(data.sets);
      }
    } catch (error) {
      console.error('Error fetching sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const getTotalFundsManaged = () => {
    return sets.reduce((total, set) => {
      return total + (set.monthlyAmount * set.totalMembers);
    }, 0);
  };

  const getTotalMembers = () => {
    return sets.reduce((total, set) => total + set.activeMembers.length, 0);
  };

  const getUpcomingDraws = () => {
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    
    return sets.filter(set => {
      return next7Days.some(date => date.getDate() === set.drawDate);
    });
  };

  const canTriggerDraw = (set: ChitSet) => {
    const today = new Date();
    return today.getDate() === set.drawDate && set.activeMembers.length >= 3;
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
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Management Overview</h2>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Funds Managed</div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{getTotalFundsManaged().toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Active Members</div>
          <div className="text-3xl font-bold text-gray-900">{getTotalMembers()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Upcoming Draws (Next 7 Days)</div>
          <div className="text-3xl font-bold text-gray-900">{getUpcomingDraws().length}</div>
        </div>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Step 1: Create Chit Sets</h3>
          <CreateChitSet members={members} onSuccess={() => { fetchSets(); fetchMembers(); }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Step 2: Upload Members</h3>
          <BulkUpload />
        </div>
      </div>

      {/* Chit Fund Calculations */}
      {sets.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">💰 Chit Fund Distribution Calculations</h3>
          <div className="space-y-6">
            {sets.map((set) => (
              <ChitFundCalculation key={set._id} chitSet={set} />
            ))}
          </div>
        </div>
      )}

      {/* Set Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sets.map((set) => {
          const remainingMembers = set.activeMembers.length;
          const progress = ((set.totalMembers - remainingMembers) / set.totalMembers) * 100;
          const canDraw = canTriggerDraw(set);

          return (
            <div
              key={set._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{set.name}</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Members Remaining</span>
                  <span className="font-medium">{remainingMembers} / {set.totalMembers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Amount:</span>
                  <span className="font-medium">₹{set.monthlyAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Draw Date:</span>
                  <span className="font-medium">Day {set.drawDate}</span>
                </div>
              </div>

              {/* Previous Winners Section */}
              {set.winnerHistory && set.winnerHistory.length > 0 && (
                <div className="mb-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="mr-2">🏆</span>
                      Previous Winners ({set.winnerHistory.length})
                    </h4>
                    <Link
                      href={`/winners/${set._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {set.winnerHistory.slice(-3).reverse().map((winner: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-2 border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-xs">
                              {winner.memberName}
                            </div>
                            <div className="text-xs text-gray-600 font-mono mt-0.5">
                              {winner.memberId}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {format(new Date(winner.dateWon), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-amber-600 ml-2">
                            ₹{winner.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {set.winnerHistory.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        <Link
                          href={`/winners/${set._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View {set.winnerHistory.length - 3} more winners →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedSet(set)}
                  className="flex-1 py-2 px-4 rounded-md font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  View Members
                </button>
                <button
                  onClick={() => {
                    // Navigate to Live Draw tab with this set
                    window.location.href = '/?tab=draw&setId=' + set._id;
                  }}
                  disabled={!canDraw}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    canDraw
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canDraw ? 'Trigger Draw' : `Draw on Day ${set.drawDate}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member List Modal */}
      {selectedSet && (
        <ChitSetMembers
          setId={selectedSet._id}
          setName={selectedSet.name}
          onClose={() => setSelectedSet(null)}
        />
      )}
    </div>
  );
}

