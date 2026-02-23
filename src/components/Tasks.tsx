import { CheckCircle, ListTodo, Copy, Users, Gift, PlayCircle } from 'lucide-react';
import { completeTask } from '../api';

interface TasksProps {
  userId: number;
  balance: number;
  referralCount: number;
  referralLink: string;
  adsWatched: number;
  claimedBonuses: number[];
  setBalance: (newBalance: number) => void;
}

const AD_MILESTONES = [
  { count: 5, reward: 10 },
  { count: 15, reward: 40 },
  { count: 30, reward: 99 },
  { count: 50, reward: 180 },
  { count: 100, reward: 380 },
];

export default function Tasks({ userId, balance, referralCount, referralLink, adsWatched, claimedBonuses, setBalance }: TasksProps) {
  const handleTaskComplete = async (reward: number) => {
    try {
      const result = await completeTask(userId, reward);
      setBalance(result.balance);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      alert(`Task Completed! You earned ${reward} BDT.`);
    } catch (error) {
      console.error("Task completion failed", error);
      alert("Failed to complete task. Please try again.");
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Referral link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <ListTodo className="text-purple-400" /> Earn More
        </h2>
        <p className="text-gray-400 text-sm">
          Complete tasks and invite friends to earn rewards.
        </p>
      </div>

      <div className="space-y-4">
        {/* Ad Watch Bonuses */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Gift className="text-pink-400" size={20} /> Ad Watch Bonuses
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Total Ads Watched: <span className="text-white font-bold">{adsWatched}</span>
          </p>
          
          <div className="space-y-3">
            {AD_MILESTONES.map((milestone) => {
              const isClaimed = claimedBonuses.includes(milestone.count);
              const isCompleted = adsWatched >= milestone.count;
              const progress = Math.min(100, (adsWatched / milestone.count) * 100);
              
              return (
                <div key={milestone.count} className="bg-gray-900 rounded-xl p-3 border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">Watch {milestone.count} Ads</span>
                    {isClaimed ? (
                      <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                        <CheckCircle size={12} /> Claimed
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-yellow-400">
                        {milestone.reward} BDT
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-right text-gray-500">
                    {Math.min(adsWatched, milestone.count)}/{milestone.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Users className="text-blue-400" size={20} /> Refer & Earn
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            Invite friends and earn <span className="text-white font-bold">50 BDT</span> for each referral!
          </p>
          
          <div className="flex items-center bg-gray-900 rounded-xl p-2 mb-3 border border-gray-700">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-300 outline-none px-2"
            />
            <button
              onClick={copyReferralLink}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Copy size={14} /> Copy
            </button>
          </div>
          
          <p className="text-sm text-gray-400">
            Friends referred: <span className="text-yellow-400 font-bold">{referralCount}</span>
          </p>
        </div>

        {/* Adsgram Task Component Placeholder */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2">Partner Tasks</h3>
          
          {window.Telegram?.WebApp?.initData ? (
            <div id="adsgram-task-container">
              {/* @ts-ignore */}
              <adsgram-task blockId="task-23320"></adsgram-task>
            </div>
          ) : (
            <div className="bg-gray-900 p-4 rounded-xl text-center border border-gray-700 border-dashed">
              <p className="text-gray-400 text-sm">
                Partner tasks are only available within the Telegram app.
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            Complete the tasks above to earn rewards directly.
          </p>
        </div>

        {/* Manual Tasks List (Mock) */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-white">Daily Challenges</h3>
          
          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                📢
              </div>
              <div>
                <p className="text-white font-medium">Join Telegram Channel</p>
                <p className="text-xs text-green-400">+30 BDT</p>
              </div>
            </div>
            <button 
              onClick={() => handleTaskComplete(30)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
            >
              Start
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                👀
              </div>
              <div>
                <p className="text-white font-medium">Watch Promo Video</p>
                <p className="text-xs text-green-400">+15 BDT</p>
              </div>
            </div>
            <button 
              onClick={() => handleTaskComplete(15)}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition-colors"
            >
              Watch
            </button>
          </div>
        </div>

        {/* Footer Links - Privacy & Terms */}
        <div className="mt-8 text-xs text-gray-500 text-center border-t border-gray-700 pt-4">
          <p className="mb-1">© 2026 Spin2Earn. All rights reserved.</p>
          <p>
            <a href="/privacy.html" target="_blank" className="text-blue-400 underline mx-2">Privacy Policy</a> | 
            <a href="/terms.html" target="_blank" className="text-blue-400 underline mx-2">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
