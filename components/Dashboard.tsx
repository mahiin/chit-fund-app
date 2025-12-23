'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ChitSetMembers from './ChitSetMembers';

interface ChitSet {
  _id: string;
  name: string;
  totalMembers: number;
  drawDate: number;
  monthlyAmount: number;
  activeMembers: any[];
  winnerHistory: any[];
}

export default function Dashboard() {
  const [sets, setSets] = useState<ChitSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<ChitSet | null>(null);

  useEffect(() => {
    fetchSets();
    
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

  const getNextDrawDate = (drawDate: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    let nextDraw = new Date(today.getFullYear(), today.getMonth(), drawDate);
    
    if (currentDay >= drawDate) {
      nextDraw = new Date(today.getFullYear(), today.getMonth() + 1, drawDate);
    }
    
    return nextDraw;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Professional color schemes for different cards
  const colorSchemes = [
    { gradient: 'from-slate-500 to-slate-600', bg: 'bg-gradient-to-br from-slate-50 to-slate-100', accent: 'text-slate-700', button: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800' },
    { gradient: 'from-blue-500 to-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-blue-100', accent: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' },
    { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', accent: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800' },
    { gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', accent: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800' },
    { gradient: 'from-teal-500 to-teal-600', bg: 'bg-gradient-to-br from-teal-50 to-teal-100', accent: 'text-teal-700', button: 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800' },
    { gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', accent: 'text-cyan-700', button: 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800' },
  ];

  return (
    <div>
      <h2 className="text-4xl font-bold text-slate-800 mb-8">
        Chit Fund Groups
      </h2>
      
      {sets.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white rounded-xl shadow-md p-12 border-2 border-dashed border-slate-300 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">No Chit Fund Groups Found</h3>
            <p className="text-slate-500 text-lg mb-6">Create your first chit fund group to get started</p>
            <div className="flex justify-center space-x-4">
              <a
                href="/admin/create-sets"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                ➕ Create Sets
              </a>
              <a
                href="/upload"
                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                📤 Upload Members
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set, index) => {
            const remainingMembers = set.activeMembers.length;
            const progress = ((set.totalMembers - remainingMembers) / set.totalMembers) * 100;
            const nextDraw = getNextDrawDate(set.drawDate);
            const colors = colorSchemes[index % colorSchemes.length];

            return (
              <div
                key={set._id}
                className={`${colors.bg} rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-white`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${colors.gradient} mb-3`}></div>
                    <h3 className="text-xl font-bold text-gray-800">{set.name}</h3>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Members Remaining</span>
                    <span className={`font-bold ${colors.accent}`}>{remainingMembers} / {set.totalMembers}</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 shadow-inner">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 shadow-md`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <span className="text-gray-600 font-medium">Monthly Amount:</span>
                    <span className={`font-bold text-lg ${colors.accent}`}>₹{set.monthlyAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <span className="text-gray-600 font-medium">Next Draw Date:</span>
                    <span className="font-bold text-gray-800">
                      {format(nextDraw, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                    <span className="text-gray-600 font-medium">Winners:</span>
                    <span className="font-bold text-yellow-600 text-lg">{set.winnerHistory.length}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSet(set)}
                  className={`w-full ${colors.button} text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                >
                  👥 View Members
                </button>
              </div>
            );
          })}
        </div>
      )}

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

