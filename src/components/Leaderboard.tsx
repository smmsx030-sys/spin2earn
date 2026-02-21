import { useState, useEffect } from 'react';
import { Trophy, Users, Medal } from 'lucide-react';
import { fetchLeaderboard, LeaderboardData } from '../api';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'earners' | 'referrers'>('earners');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const list = activeTab === 'earners' ? data?.topEarners : data?.topReferrers;

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Trophy className="text-yellow-400" /> Leaderboard
        </h2>
        <p className="text-gray-400 text-sm">
          Top performers in the community
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-800 rounded-xl">
        <button
          onClick={() => setActiveTab('earners')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'earners' 
              ? 'bg-gray-700 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Top Earners
        </button>
        <button
          onClick={() => setActiveTab('referrers')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'referrers' 
              ? 'bg-gray-700 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Top Referrers
        </button>
      </div>

      {/* List */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-lg">
        {list?.map((item, index) => (
          <div 
            key={item.userId}
            className={`flex items-center justify-between p-4 border-b border-gray-700 last:border-0 ${
              index < 3 ? 'bg-gray-800/50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                  index === 1 ? 'bg-gray-400/20 text-gray-400' : 
                  index === 2 ? 'bg-orange-500/20 text-orange-500' : 
                  'bg-gray-700 text-gray-400'}
              `}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-xs text-gray-500">ID: {item.userId}</p>
              </div>
            </div>
            
            <div className="font-bold text-right">
              {activeTab === 'earners' ? (
                <span className="text-green-400">
                  {/* @ts-ignore */}
                  {item.amount.toLocaleString()} BDT
                </span>
              ) : (
                <span className="text-blue-400 flex items-center gap-1">
                  {/* @ts-ignore */}
                  {item.count} <Users size={14} />
                </span>
              )}
            </div>
          </div>
        ))}

        {list?.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
