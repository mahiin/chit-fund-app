'use client';

import { useState } from 'react';

interface ChitSet {
  _id: string;
  name: string;
  totalMembers: number;
  monthlyAmount: number;
  activeMembers: any[];
  winnerHistory: any[];
}

interface DrawCalculation {
  drawNumber: number;
  totalCollection: number;
  winnersAmount: number; // 3 winners get 75% (25L each for 50K example)
  remainingAmount: number; // 25% remaining
  remainingParticipants: number;
  eachParticipantShare: number;
  isLastDraw: boolean;
}

interface ChitFundCalculationProps {
  chitSet: ChitSet;
}

export default function ChitFundCalculation({ chitSet }: ChitFundCalculationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate all draws
  const calculateDraws = (): DrawCalculation[] => {
    const calculations: DrawCalculation[] = [];
    const totalMembers = chitSet.totalMembers;
    const monthlyAmount = chitSet.monthlyAmount;
    const totalCollection = totalMembers * monthlyAmount;
    
    // Each winner gets 25% of total collection (25L each for 50K example)
    const eachWinnerAmount = totalCollection / 4; // 25% per winner
    const winnersAmount = eachWinnerAmount * 3; // 75% total to 3 winners
    const remainingAmount = totalCollection - winnersAmount; // 25% remaining
    
    // Calculate number of draws: (200 - 2) / 3 = 66 draws (last draw has 2 people)
    // Formula: (totalMembers - 2) / 3 + 1
    const numberOfDraws = Math.floor((totalMembers - 2) / 3) + 1;
    
    for (let drawNumber = 1; drawNumber <= numberOfDraws; drawNumber++) {
      // After each draw, 3 winners are removed (except last draw)
      let remainingParticipants: number;
      if (drawNumber === numberOfDraws) {
        // Last draw: only 2 people remain
        remainingParticipants = 2;
      } else {
        // After draw N, remaining = total - (N * 3)
        remainingParticipants = totalMembers - (drawNumber * 3);
      }
      
      const eachParticipantShare = remainingAmount / remainingParticipants;
      const isLastDraw = drawNumber === numberOfDraws;
      
      calculations.push({
        drawNumber,
        totalCollection,
        winnersAmount,
        remainingAmount,
        remainingParticipants,
        eachParticipantShare: Math.round(eachParticipantShare),
        isLastDraw,
      });
    }
    
    return calculations;
  };

  const calculations = calculateDraws();
  const completedDraws = chitSet.winnerHistory.length;
  const nextDraw = completedDraws + 1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">💰</span>
          Distribution Calculation - {chitSet.name}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
        >
          {isExpanded ? '▼ Collapse' : '▶ Expand'}
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-xs text-blue-700 font-medium mb-1">Monthly Collection</div>
          <div className="text-2xl font-bold text-blue-900">
            ₹{(chitSet.totalMembers * chitSet.monthlyAmount).toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {chitSet.totalMembers} × ₹{chitSet.monthlyAmount.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-xs text-green-700 font-medium mb-1">3 Winners Amount</div>
          <div className="text-2xl font-bold text-green-900">
            ₹{((chitSet.totalMembers * chitSet.monthlyAmount * 3) / 4).toLocaleString()}
          </div>
          <div className="text-xs text-green-600 mt-1">
            ₹{((chitSet.totalMembers * chitSet.monthlyAmount) / 4).toLocaleString()} each (25% per winner)
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-xs text-purple-700 font-medium mb-1">Remaining Amount</div>
          <div className="text-2xl font-bold text-purple-900">
            ₹{((chitSet.totalMembers * chitSet.monthlyAmount) / 4).toLocaleString()}
          </div>
          <div className="text-xs text-purple-600 mt-1">Divided among remaining</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="text-xs text-amber-700 font-medium mb-1">Total Draws</div>
          <div className="text-2xl font-bold text-amber-900">{calculations.length}</div>
          <div className="text-xs text-amber-600 mt-1">
            {completedDraws} completed, {calculations.length - completedDraws} remaining
          </div>
        </div>
      </div>

      {/* Next Draw Preview */}
      {nextDraw <= calculations.length && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-indigo-900 mb-1">
                📅 Next Draw #{nextDraw} Preview
              </div>
              <div className="text-xs text-indigo-700">
                Remaining Participants: <span className="font-bold">{calculations[nextDraw - 1].remainingParticipants}</span> | 
                Each Share: <span className="font-bold">₹{calculations[nextDraw - 1].eachParticipantShare.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-indigo-900">
                ₹{calculations[nextDraw - 1].eachParticipantShare.toLocaleString()}
              </div>
              <div className="text-xs text-indigo-600">per participant</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Table */}
      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">Complete Draw Schedule</h4>
            <span className="text-xs text-gray-500">
              Tenure: 5 Years 6 Months ({calculations.length} draws)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Draw #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Collection</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">3 Winners</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Remaining Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Remaining Participants</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Each Share</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {calculations.map((calc, index) => {
                  const isCompleted = index < completedDraws;
                  const isCurrent = index === completedDraws;
                  return (
                    <tr
                      key={calc.drawNumber}
                      className={`${
                        isCurrent
                          ? 'bg-indigo-50 border-l-4 border-indigo-500'
                          : isCompleted
                          ? 'bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {calc.drawNumber}
                        {calc.isLastDraw && <span className="ml-2 text-xs text-amber-600">(Last)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₹{calc.totalCollection.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-green-700 font-medium">
                        ₹{calc.winnersAmount.toLocaleString()}
                        <div className="text-xs text-gray-500">(₹{(calc.totalCollection / 4).toLocaleString()} each)</div>
                      </td>
                      <td className="px-4 py-3 text-purple-700 font-medium">
                        ₹{calc.remainingAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {calc.remainingParticipants}
                      </td>
                      <td className="px-4 py-3 text-blue-700 font-bold">
                        ₹{calc.eachParticipantShare.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {isCompleted ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ✓ Completed
                          </span>
                        ) : isCurrent ? (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                            🔄 Next
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

