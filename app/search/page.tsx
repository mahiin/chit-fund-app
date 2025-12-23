'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface SearchResult {
  found: boolean;
  member?: {
    name: string;
    memberId: string;
    mobile: string;
    email: string;
    location: string;
  };
  winningHistory?: Array<{
    setName: string;
    dateWon: Date;
    amount: number;
  }>;
  message?: string;
}

export default function SearchPage() {
  const [searchType, setSearchType] = useState<'mobile' | 'memberId'>('mobile');
  const [searchValue, setSearchValue] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      alert('Please enter a search value');
      return;
    }

    setLoading(true);
    try {
      const param = searchType === 'mobile' ? 'mobile' : 'memberId';
      const response = await fetch(`/api/search?${param}=${encodeURIComponent(searchValue)}`);
      const data = await response.json();
      
      if (data.success) {
        setResult({
          found: data.found,
          member: data.member,
          winningHistory: data.winningHistory?.map((w: any) => ({
            ...w,
            dateWon: new Date(w.dateWon),
          })),
          message: data.message,
        });
      } else {
        alert('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Member</h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search By
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="mobile"
                  checked={searchType === 'mobile'}
                  onChange={(e) => setSearchType(e.target.value as 'mobile')}
                  className="mr-2"
                />
                Mobile Number
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="memberId"
                  checked={searchType === 'memberId'}
                  onChange={(e) => setSearchType(e.target.value as 'memberId')}
                  className="mr-2"
                />
                Member ID
              </label>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'mobile' ? 'Enter mobile number' : 'Enter Member ID (e.g., AGR1234A)'}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {result.found && result.member ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Member Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="text-lg font-medium text-gray-900">{result.member.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Member ID</div>
                    <div className="text-lg font-medium text-gray-900">{result.member.memberId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Mobile</div>
                    <div className="text-lg font-medium text-gray-900">{result.member.mobile}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="text-lg font-medium text-gray-900">{result.member.email}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="text-lg font-medium text-gray-900">{result.member.location}</div>
                  </div>
                </div>

                {result.winningHistory && result.winningHistory.length > 0 ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Winning History</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date Won
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Set Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {result.winningHistory.map((win, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {format(win.dateWon, 'MMM dd, yyyy')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {win.setName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{win.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No winning history found for this member.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">{result.message || 'Member not found'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


