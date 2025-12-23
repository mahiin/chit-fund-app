'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

interface Winner {
  memberId: string;
  memberName: string;
  dateWon: Date;
  amount: number;
}

interface ChitSet {
  _id: string;
  name: string;
  monthlyAmount: number;
  winnerHistory: any[];
}

interface WinnersByMonth {
  [key: string]: Winner[];
}

export default function WinnerHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.setId as string;
  const [chitSet, setChitSet] = useState<ChitSet | null>(null);
  const [winnersByMonth, setWinnersByMonth] = useState<WinnersByMonth>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (setId) {
      fetchWinnerHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  const fetchWinnerHistory = async () => {
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      if (data.success) {
        const set = data.sets.find((s: ChitSet) => s._id === setId);
        if (set) {
          setChitSet(set);
          
          // Group winners by month
          const grouped: WinnersByMonth = {};
          set.winnerHistory.forEach((winner: any) => {
            const date = new Date(winner.dateWon);
            const monthKey = format(date, 'MMMM yyyy'); // e.g., "December 2025"
            
            if (!grouped[monthKey]) {
              grouped[monthKey] = [];
            }
            
            grouped[monthKey].push({
              memberId: winner.memberId,
              memberName: winner.memberName,
              dateWon: date,
              amount: winner.amount,
            });
          });
          
          // Sort winners within each month by date (newest first)
          Object.keys(grouped).forEach(month => {
            grouped[month].sort((a, b) => b.dateWon.getTime() - a.dateWon.getTime());
          });
          
          setWinnersByMonth(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching winner history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsApp = (winner: Winner) => {
    const message = `Congratulations ${winner.memberName}! You have won ₹${winner.amount.toLocaleString()} in ${chitSet?.name}. Member ID: ${winner.memberId}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chitSet) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chit Set Not Found</h2>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function getMonthNumber(monthName: string): string {
    const months: { [key: string]: string } = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    return months[monthName] || '01';
  }

  // Sort months by date (newest first)
  const sortedMonthsByDate = Object.keys(winnersByMonth).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const dateA = new Date(parseInt(yearA), parseInt(getMonthNumber(monthA)) - 1, 1);
    const dateB = new Date(parseInt(yearB), parseInt(getMonthNumber(monthB)) - 1, 1);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Winner History
          </h1>
          <h2 className="text-2xl text-gray-700 mb-4">{chitSet.name}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Monthly Amount: <span className="font-semibold">₹{chitSet.monthlyAmount.toLocaleString()}</span></span>
            <span>•</span>
            <span>Total Winners: <span className="font-semibold">{chitSet.winnerHistory.length}</span></span>
          </div>
        </div>

        {/* Winners by Month */}
        {sortedMonthsByDate.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No winners yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedMonthsByDate.map((month) => {
              const winners = winnersByMonth[month];
              const totalAmount = winners.reduce((sum, w) => sum + w.amount, 0);
              
              return (
                <div key={month} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Month Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold">{month}</h3>
                      <div className="text-right">
                        <div className="text-sm opacity-90">Total Winners</div>
                        <div className="text-xl font-bold">{winners.length}</div>
                        <div className="text-sm opacity-90 mt-1">Total Amount</div>
                        <div className="text-lg font-semibold">₹{totalAmount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Winners List */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {winners.map((winner, idx) => (
                        <div
                          key={idx}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition-colors bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="text-lg font-bold text-gray-900 mb-1">
                                {winner.memberName}
                              </div>
                              <div className="text-sm text-gray-600 font-mono mb-2">
                                {winner.memberId}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(winner.dateWon, 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold text-emerald-600">
                                ₹{winner.amount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => sendWhatsApp(winner)}
                            className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                          >
                            📱 Send WhatsApp
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

