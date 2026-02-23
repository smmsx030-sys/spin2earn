import { useState, useEffect } from 'react';
import SpinWheel from './components/SpinWheel';
import Withdraw from './components/Withdraw';
import Tasks from './components/Tasks';
import Leaderboard from './components/Leaderboard';
import { Home, Wallet, ListTodo, User, Trophy } from 'lucide-react';
import { TelegramUser } from './types';
import { fetchUser, UserData } from './api';

function App() {
  const [activeTab, setActiveTab] = useState<'spin' | 'tasks' | 'withdraw' | 'leaderboard'>('spin');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NEW: separate state for task tab ad watch
  const [taskAdsWatched, setTaskAdsWatched] = useState(0);
  const [taskClaimedBonuses, setTaskClaimedBonuses] = useState<number[]>([]);

  const [debugStatus, setDebugStatus] = useState('Initializing...');

  useEffect(() => {
    const initApp = async () => {
      setDebugStatus('Checking Telegram WebApp...');
      const tg = window.Telegram?.WebApp;
      let currentTgUser: TelegramUser | null = null;
      
      if (tg) {
        tg.ready();
        tg.expand();
        
        document.body.style.backgroundColor = tg.backgroundColor || '#111827';
        
        currentTgUser = tg.initDataUnsafe?.user || null;
        setTgUser(currentTgUser);
      }

      const userId = currentTgUser?.id || 123456; 

      try {
        setDebugStatus(`Fetching user data for ID: ${userId}...`);
        const data = await fetchUser(userId);
        setDebugStatus('User data loaded.');
        setUserData(data);
        // NEW: set task-specific states from fetched data
        setTaskAdsWatched(data.taskAdsWatched || 0);
        setTaskClaimedBonuses(data.taskClaimedBonuses || []);
      } catch (err) {
        console.error("Failed to load user data", err);
        setError(`Failed to load user data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoaded(true);
      }
    };

    initApp();
  }, []);

  const handleBalanceUpdate = (newBalance: number) => {
    if (userData) {
      setUserData({ ...userData, balance: newBalance });
    }
  };

  const handleSpinComplete = (newBalance: number, newSpins: number, newAdsWatched: number, bonusAwarded: number) => {
    if (userData) {
      const updatedClaimedBonuses = [...userData.claimedBonuses];
      if (bonusAwarded > 0) {
        if (newAdsWatched >= 5 && !updatedClaimedBonuses.includes(5)) updatedClaimedBonuses.push(5);
        if (newAdsWatched >= 15 && !updatedClaimedBonuses.includes(15)) updatedClaimedBonuses.push(15);
        if (newAdsWatched >= 30 && !updatedClaimedBonuses.includes(30)) updatedClaimedBonuses.push(30);
        if (newAdsWatched >= 50 && !updatedClaimedBonuses.includes(50)) updatedClaimedBonuses.push(50);
        if (newAdsWatched >= 100 && !updatedClaimedBonuses.includes(100)) updatedClaimedBonuses.push(100);
      }

      setUserData({ 
        ...userData, 
        balance: newBalance, 
        spinsLeft: newSpins,
        adsWatched: newAdsWatched,
        claimedBonuses: updatedClaimedBonuses
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4 text-center gap-4">
        <div className="text-red-400 text-xl font-bold">Error Loading App</div>
        <p className="text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading Spin2Earn...</p>
        <p className="text-xs text-gray-500 font-mono">{debugStatus}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pb-20">
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50 shadow-md">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {tgUser?.username ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                {tgUser.first_name.charAt(0)}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <User size={20} />
              </div>
            )}
            <div>
              <h1 className="font-bold text-sm">{tgUser ? `${tgUser.first_name} ${tgUser.last_name || ''}` : 'Guest User'}</h1>
              <p className="text-xs text-gray-400">ID: {userData?.userId || 'Unknown'}</p>
            </div>
          </div>
          <div className="bg-gray-900 px-4 py-2 rounded-full border border-gray-700 flex items-center gap-2">
            <span className="text-yellow-400">💰</span>
            <span className="font-mono font-bold">{userData?.balance.toFixed(2) || '0.00'} BDT</span>
          </div>
        </div>
      </header>

      <main className="pt-6">
        {activeTab === 'spin' && userData && (
          <SpinWheel 
            userId={userData.userId}
            balance={userData.balance} 
            spinsLeft={userData.spinsLeft}
            onSpinComplete={handleSpinComplete} 
          />
        )}
        {activeTab === 'tasks' && userData && (
          <Tasks 
            userId={userData.userId}
            balance={userData.balance} 
            referralCount={userData.referralCount}
            referralLink={userData.referralLink}
            // NEW: pass task-specific props
            taskAdsWatched={taskAdsWatched}
            taskClaimedBonuses={taskClaimedBonuses}
            setBalance={handleBalanceUpdate}
            setTaskAdsWatched={setTaskAdsWatched}
            setTaskClaimedBonuses={setTaskClaimedBonuses}
          />
        )}
        {activeTab === 'withdraw' && userData && (
          <Withdraw 
            userId={userData.userId}
            balance={userData.balance} 
            setBalance={handleBalanceUpdate} 
          />
        )}
        {activeTab === 'leaderboard' && (
          <Leaderboard />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 pb-safe">
        <div className="flex justify-around items-center max-w-md mx-auto h-16">
          <button
            onClick={() => setActiveTab('spin')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${
              activeTab === 'spin' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Spin</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${
              activeTab === 'tasks' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <ListTodo size={24} />
            <span className="text-xs font-medium">Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${
              activeTab === 'leaderboard' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Trophy size={24} />
            <span className="text-xs font-medium">Leaders</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${
              activeTab === 'withdraw' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Wallet size={24} />
            <span className="text-xs font-medium">Withdraw</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
