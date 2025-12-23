'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DataCounts {
  members: number;
  chitSets: number;
  totalWinners: number;
}

export default function CleanupPage() {
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/admin/cleanup');
      const data = await response.json();
      if (data.success) {
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async (type: 'all' | 'members' | 'sets') => {
    const confirmMessage = 
      type === 'all' 
        ? 'Are you sure you want to delete ALL data (members and chit sets)? This cannot be undone!'
        : type === 'members'
        ? 'Are you sure you want to delete ALL members? This cannot be undone!'
        : 'Are you sure you want to delete ALL chit sets? This cannot be undone!';

    if (!confirm(confirmMessage)) {
      return;
    }

    setCleaning(true);
    setResult(null);

    try {
      const response = await fetch(`/api/admin/cleanup?type=${type}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'Data cleaned successfully',
        });
        await fetchCounts();
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to cleanup data',
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      setResult({
        success: false,
        message: 'Failed to cleanup data',
      });
    } finally {
      setCleaning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">Database Cleanup</h1>

        {/* Current Data Counts */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Current Data</h2>
          {counts && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 mb-1">Total Members</div>
                <div className="text-3xl font-bold text-blue-700">{counts.members}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 mb-1">Chit Sets</div>
                <div className="text-3xl font-bold text-purple-700">{counts.chitSets}</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="text-sm text-emerald-600 mb-1">Total Winners</div>
                <div className="text-3xl font-bold text-emerald-700">{counts.totalWinners}</div>
              </div>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start">
            <div className="text-3xl mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Warning</h3>
              <p className="text-red-700">
                This action will permanently delete data from the database. This cannot be undone.
                Make sure you have a backup if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Cleanup Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Cleanup Options</h2>
          
          <div className="space-y-4">
            {/* Delete All */}
            <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Delete All Data</h3>
                  <p className="text-sm text-red-700">
                    Removes all members, chit sets, and winner history
                  </p>
                </div>
                <button
                  onClick={() => handleCleanup('all')}
                  disabled={cleaning}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {cleaning ? 'Cleaning...' : '🗑️ Delete All'}
                </button>
              </div>
            </div>

            {/* Delete Members Only */}
            <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-orange-800 mb-1">Delete All Members</h3>
                  <p className="text-sm text-orange-700">
                    Removes all member records. Chit sets will remain but will have no active members.
                  </p>
                </div>
                <button
                  onClick={() => handleCleanup('members')}
                  disabled={cleaning}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {cleaning ? 'Cleaning...' : '👥 Delete Members'}
                </button>
              </div>
            </div>

            {/* Delete Chit Sets Only */}
            <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Delete All Chit Sets</h3>
                  <p className="text-sm text-yellow-700">
                    Removes all fund groups and winner history. Members will remain.
                  </p>
                </div>
                <button
                  onClick={() => handleCleanup('sets')}
                  disabled={cleaning}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {cleaning ? 'Cleaning...' : '📋 Delete Chit Sets'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border-2 border-green-200 text-green-800' 
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-2xl mr-2">{result.success ? '✅' : '❌'}</span>
              <span className="font-semibold">{result.message}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">After Cleanup</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Upload members using the CSV file (sample-200-members.csv)</li>
            <li>Create chit fund sets using the &quot;Create Sets&quot; page</li>
            <li>Or manually create chit sets from the Management tab</li>
          </ol>
        </div>
      </div>
    </div>
  );
}


