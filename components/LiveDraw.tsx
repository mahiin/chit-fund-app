'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import SpinnerSlot from './SpinnerSlot';

interface ChitSet {
  _id: string;
  name: string;
  totalMembers: number;
  drawDate: number;
  monthlyAmount: number;
  activeMembers: any[];
}

interface Member {
  _id: string;
  name: string;
  memberId: string;
  mobile: string;
}

interface Winner {
  memberId: string;
  memberName: string;
  dateWon: Date;
  amount: number;
}

export default function LiveDraw() {
  const [sets, setSets] = useState<ChitSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<ChitSet | null>(null);
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [currentSpinningSlot, setCurrentSpinningSlot] = useState<number>(-1); // -1 = none, 0-2 = slot index
  const [winners, setWinners] = useState<Winner[]>([]);
  const [targetMemberIds, setTargetMemberIds] = useState<string[]>(['', '', '']); // Target IDs for each slot
  const [pendingWinners, setPendingWinners] = useState<{ [key: number]: Winner }>({}); // Store winners temporarily until animation completes
  const [loading, setLoading] = useState(true);
  const [drawComplete, setDrawComplete] = useState(false);
  const [testMode, setTestMode] = useState(false); // Test mode to bypass date restrictions
  const [drawingWinner, setDrawingWinner] = useState<number>(-1); // Which slot is currently being drawn

  useEffect(() => {
    fetchSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedSet) {
      fetchActiveMembers();
      checkDrawStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSet]);

  const checkDrawStatus = async () => {
    if (!selectedSet) return;
    
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      if (data.success) {
        const set = data.sets.find((s: ChitSet) => s._id === selectedSet._id);
        if (set && set.winnerHistory && set.winnerHistory.length > 0) {
          // Check if last 3 winners were drawn today
          const recentWinners = set.winnerHistory.slice(-3);
          const lastWinnerDate = new Date(recentWinners[recentWinners.length - 1]?.dateWon);
          const today = new Date();
          
          if (
            lastWinnerDate.getDate() === today.getDate() &&
            lastWinnerDate.getMonth() === today.getMonth() &&
            lastWinnerDate.getFullYear() === today.getFullYear() &&
            recentWinners.length >= 3
          ) {
            // Draw was completed today
            setDrawComplete(true);
            setWinners(recentWinners.map((w: any) => ({
              memberId: w.memberId,
              memberName: w.memberName,
              dateWon: new Date(w.dateWon),
              amount: w.amount,
            })));
            setTargetMemberIds(recentWinners.map((w: any) => w.memberId));
          } else {
            // Reset for new draw
            setDrawComplete(false);
            setWinners([]);
            setTargetMemberIds(['', '', '']);
          }
        } else {
          setDrawComplete(false);
          setWinners([]);
          setTargetMemberIds(['', '', '']);
        }
      }
    } catch (error) {
      console.error('Error checking draw status:', error);
    }
  };

  const fetchSets = async () => {
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      if (data.success) {
        setSets(data.sets);
        if (data.sets.length > 0 && !selectedSet) {
          setSelectedSet(data.sets[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMembers = async () => {
    if (!selectedSet) return;
    
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      if (data.success) {
        const set = data.sets.find((s: ChitSet) => s._id === selectedSet._id);
        if (set) {
          // Get active members (exclude previous winners)
          const allActiveMembers = set.activeMembers || [];
          
          // Get previous winner IDs to exclude them
          const previousWinnerIds = set.winnerHistory?.map((w: any) => w.memberId) || [];
          
          // Filter out previous winners from active members
          const eligibleMembers = allActiveMembers.filter((member: any) => {
            if (member.memberId) {
              return !previousWinnerIds.includes(member.memberId);
            }
            return true;
          });
          
          setActiveMembers(eligibleMembers);
        }
      }
    } catch (error) {
      console.error('Error fetching active members:', error);
    }
  };

  const checkIfDrawDate = () => {
    if (!selectedSet) return false;
    if (testMode) return true;
    const today = new Date();
    return today.getDate() === selectedSet.drawDate;
  };

  const drawSingleWinner = async (slotIndex: number) => {
    if (!selectedSet || activeMembers.length < 1) {
      alert('Not enough active members to draw a winner');
      return;
    }

    if (!checkIfDrawDate() && !testMode) {
      alert(`Draw can only be conducted on day ${selectedSet.drawDate} of the month`);
      return;
    }

    if (winners[slotIndex]) {
      alert('This slot already has a winner');
      return;
    }

    setDrawingWinner(slotIndex);
    
    try {
      const response = await fetch('/api/draw-single-winner', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setId: selectedSet._id }),
      });

      const data = await response.json();
      if (data.success && data.winner) {
        const newWinner: Winner = {
          memberId: data.winner.memberId,
          memberName: data.winner.memberName,
          dateWon: new Date(data.winner.dateWon),
          amount: data.winner.amount,
        };
        
        // Store winner temporarily until animation completes
        setPendingWinners(prev => ({
          ...prev,
          [slotIndex]: newWinner
        }));
        
        // Set target member ID for spinning
        const newTargets = [...targetMemberIds];
        newTargets[slotIndex] = data.winner.memberId;
        setTargetMemberIds(newTargets);
        
        // Start spinning - don't set winner yet, wait for animation
        setCurrentSpinningSlot(slotIndex);
        
        // Refresh members
        await fetchActiveMembers();
        await fetchSets();
      } else {
        alert(data.error || 'Failed to draw winner');
        setDrawingWinner(-1);
      }
    } catch (error) {
      console.error('Error drawing winner:', error);
      alert('Failed to draw winner');
      setDrawingWinner(-1);
    }
  };

  const handleSlotSpinComplete = (slotIndex: number) => {
    // Animation complete, now set the winner from pending winners
    const pendingWinner = pendingWinners[slotIndex];
    if (pendingWinner) {
      const newWinners = [...winners];
      newWinners[slotIndex] = pendingWinner;
      setWinners(newWinners);
      
      // Remove from pending
      setPendingWinners(prev => {
        const updated = { ...prev };
        delete updated[slotIndex];
        return updated;
      });
      
      // Check if all 3 winners are drawn
      if (newWinners.filter(w => w).length === 3) {
        setDrawComplete(true);
      }
    }
    
    setCurrentSpinningSlot(-1);
    setDrawingWinner(-1);
  };

  const sendWhatsApp = (winner: Winner) => {
    const message = `Congratulations ${winner.memberName}! You have won ₹${winner.amount.toLocaleString()} in ${selectedSet?.name}. Member ID: ${winner.memberId}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const resetDraw = () => {
    setWinners([]);
    setTargetMemberIds(['', '', '']);
    setPendingWinners({});
    setDrawComplete(false);
    setCurrentSpinningSlot(-1);
    setDrawingWinner(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold mb-8 text-center text-slate-100">🎰 Live Draw</h2>

        {/* Set Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-slate-300">Select Chit Fund Group</label>
          <select
            value={selectedSet?._id || ''}
            onChange={(e) => {
              const set = sets.find(s => s._id === e.target.value);
              setSelectedSet(set || null);
              resetDraw();
            }}
            className="w-full bg-slate-800 text-white border-2 border-slate-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {sets.map((set) => (
              <option key={set._id} value={set._id}>
                {set.name} - {set.activeMembers.length} active members
              </option>
            ))}
          </select>
        </div>

        {selectedSet && (
          <>
            {/* Test Mode Toggle */}
            <div className="mb-6 flex justify-end">
              <label className="flex items-center space-x-2 cursor-pointer bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-2"
                />
                <span className="text-slate-200 font-medium">
                  🧪 Test Mode {testMode && <span className="text-amber-400">(Active)</span>}
                </span>
              </label>
            </div>

            <div className="text-center mb-8 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-xl mb-2">
                <span className="text-slate-400">Draw Date: </span>
                <span className="font-bold text-slate-100">Day {selectedSet.drawDate}</span>
              </div>
              <div className="text-lg text-slate-300">
                {format(new Date(), 'MMMM dd, yyyy')}
              </div>
              {testMode && (
                <div className="mt-2 text-sm text-amber-400 font-medium">
                  ⚠️ Test Mode: Date restrictions bypassed
                </div>
              )}
            </div>

            {/* Spinner Slot Machine */}
            <div className="mb-8">
              <div className="flex flex-col gap-6 mb-8">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex flex-col">
                    <SpinnerSlot
                      index={index}
                      isSpinning={currentSpinningSlot === index}
                      targetMemberId={targetMemberIds[index]}
                      winner={winners[index] || null}
                      onSpinComplete={() => handleSlotSpinComplete(index)}
                    />
                    {/* Button for each slot */}
                    <button
                      onClick={() => drawSingleWinner(index)}
                      disabled={
                        currentSpinningSlot !== -1 ||
                        drawingWinner !== -1 ||
                        !!winners[index] ||
                        activeMembers.length < 1 ||
                        drawComplete ||
                        (!testMode && !checkIfDrawDate())
                      }
                      className={`mt-4 px-6 py-3 text-lg font-bold rounded-lg transition-all shadow-lg ${
                        currentSpinningSlot !== -1 ||
                        drawingWinner !== -1 ||
                        !!winners[index] ||
                        activeMembers.length < 1 ||
                        drawComplete ||
                        (!testMode && !checkIfDrawDate())
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:from-amber-600 hover:to-yellow-600 transform hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      {drawingWinner === index
                        ? '🎲 Drawing...'
                        : winners[index]
                        ? `✅ Winner ${index + 1} Selected`
                        : `🎯 Choose Winner ${index + 1}`
                      }
                    </button>
                  </div>
                ))}
              </div>

              {drawComplete && (
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-center shadow-2xl"
                  >
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      Draw Complete!
                    </h3>
                    <p className="text-lg text-emerald-100">
                      All three winners have been selected
                    </p>
                  </motion.div>
                </div>
              )}

              {!checkIfDrawDate() && !testMode && (
                <p className="text-slate-400 text-sm text-center mt-2">
                  Today is {format(new Date(), 'MMMM dd')} - Draw can only be conducted on day {selectedSet.drawDate}
                </p>
              )}
              {testMode && (
                <p className="text-amber-400 text-sm text-center mt-2 font-medium">
                  🧪 Test Mode Active - You can conduct draws on any date
                </p>
              )}
            </div>

            {/* Winners Display */}
            {winners.filter(w => w).length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-slate-100">🏆 Winners</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {winners.map((winner, index) => {
                    if (!winner) return null;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-slate-800 rounded-xl p-6 border-2 border-emerald-500 shadow-xl"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-400 mb-2">
                            {winner.memberName}
                          </div>
                          <div className="text-slate-400 mb-3 font-mono">{winner.memberId}</div>
                          <div className="text-2xl font-bold text-amber-400 mb-5">
                            ₹{winner.amount.toLocaleString()}
                          </div>
                          <button
                            onClick={() => sendWhatsApp(winner)}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-md hover:shadow-lg"
                          >
                            📱 Send WhatsApp
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
