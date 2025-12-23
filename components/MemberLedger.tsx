'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface WinnerEntry {
  setName: string;
  dateWon: Date;
  memberId: string;
  memberName: string;
  amount: number;
}

export default function MemberLedger() {
  const [ledger, setLedger] = useState<WinnerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      if (data.success) {
        const allWinners: WinnerEntry[] = [];
        
        data.sets.forEach((set: any) => {
          set.winnerHistory.forEach((winner: any) => {
            allWinners.push({
              setName: set.name,
              dateWon: new Date(winner.dateWon),
              memberId: winner.memberId,
              memberName: winner.memberName,
              amount: winner.amount,
            });
          });
        });

        // Sort by date (newest first)
        allWinners.sort((a, b) => b.dateWon.getTime() - a.dateWon.getTime());
        setLedger(allWinners);
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Chit Fund Winner History', 14, 22);
    
    doc.setFontSize(12);
    let y = 30;
    
    ledger.forEach((entry, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(`${index + 1}. ${format(entry.dateWon, 'MMM dd, yyyy')}`, 14, y);
      doc.text(`   Set: ${entry.setName}`, 20, y + 6);
      doc.text(`   Winner: ${entry.memberName} (${entry.memberId})`, 20, y + 12);
      doc.text(`   Amount: ₹${entry.amount.toLocaleString()}`, 20, y + 18);
      y += 28;
    });
    
    doc.save('chit-fund-ledger.pdf');
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Member Ledger</h2>
        <button
          onClick={exportToPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Export PDF
        </button>
      </div>

      {ledger.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No winner history found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Set Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winner ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Winner Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ledger.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(entry.dateWon, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.setName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.memberId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.memberName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{entry.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


