'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import ManagementOverview from '@/components/ManagementOverview';
import MemberLedger from '@/components/MemberLedger';
import LiveDraw from '@/components/LiveDraw';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'dashboard' | 'management' | 'ledger' | 'draw';

export default function Home() {
  const router = useRouter();
  const { user, loading, logout, isAdmin, isSuperAdmin, canUpload } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Give a bit more time for session to be available after redirect
    if (!loading && !user) {
      // Small delay to allow session cookie to be read
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 shadow-lg border-b-2 border-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 flex items-center mr-4 sm:mr-8">
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">✨ Aaradhya</h1>
              </div>
              <div className="hidden lg:flex lg:space-x-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-100 text-slate-800 shadow-md'
                      : 'text-slate-200 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  📊 Dashboard
                </button>
                {isAdmin() && (
                  <button
                    onClick={() => setActiveTab('management')}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      activeTab === 'management'
                        ? 'bg-slate-100 text-slate-800 shadow-md'
                        : 'text-slate-200 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    ⚙️ Management
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'ledger'
                      ? 'bg-slate-100 text-slate-800 shadow-md'
                      : 'text-slate-200 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  📋 Member Ledger
                </button>
                {canUpload() && (
                  <Link
                    href="/upload"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap text-slate-200 hover:bg-slate-600 hover:text-white"
                  >
                    📤 Upload
                  </Link>
                )}
                <button
                  onClick={() => setActiveTab('draw')}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'draw'
                      ? 'bg-slate-100 text-slate-800 shadow-md'
                      : 'text-slate-200 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  🎰 Live Draw
                </button>
                {canUpload() && (
                  <>
                    <Link
                      href="/admin/create-sets"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap text-slate-200 hover:bg-slate-600 hover:text-white"
                    >
                      ➕ Create Sets
                    </Link>
                    <Link
                      href="/admin/users"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap text-slate-200 hover:bg-slate-600 hover:text-white"
                    >
                      👥 Users
                    </Link>
                    {isSuperAdmin() && (
                      <Link
                        href="/admin/cleanup"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap text-slate-200 hover:bg-slate-600 hover:text-white"
                      >
                        🗑️ Cleanup
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link
                href="/search"
                className="text-white hover:bg-white/20 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap"
              >
                🔍 Search
              </Link>
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-slate-500">
                <span className="text-xs text-slate-300 hidden sm:inline">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-white hover:bg-white/20 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                >
                  {isLoggingOut ? 'Logging out...' : '🚪 Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
        {activeTab === 'dashboard' && <Dashboard />}
        {isAdmin() && activeTab === 'management' && <ManagementOverview />}
        {activeTab === 'ledger' && <MemberLedger />}
        {activeTab === 'draw' && <LiveDraw />}
      </main>
    </div>
  );
}
