const API_BASE = import.meta.env.VITE_API_URL || '';

export interface UserData {
  userId: number;
  balance: number;
  spinsLeft: number;
  referralCount: number;
  referralLink: string;
  adsWatched: number;          // for spin tab
  claimedBonuses: number[];     // for spin milestones
  // NEW: fields for task tab ad watch
  taskAdsWatched: number;
  taskClaimedBonuses: number[];
}

export interface LeaderboardData {
  topEarners: { userId: number; name: string; amount: number }[];
  topReferrers: { userId: number; name: string; count: number }[];
}

export async function fetchUser(userId: number): Promise<UserData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${API_BASE}/api/user/${userId}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardData> {
  const res = await fetch(`${API_BASE}/api/leaderboard`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function submitSpin(userId: number, prizeAmount: number): Promise<{ balance: number; spinsLeft: number; adsWatched: number; bonusAwarded: number }> {
  const res = await fetch(`${API_BASE}/api/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, prizeAmount })
  });
  if (!res.ok) throw new Error('Spin failed');
  return res.json();
}

export async function completeTask(userId: number, rewardAmount: number): Promise<{ balance: number }> {
  const res = await fetch(`${API_BASE}/api/task-complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, rewardAmount })
  });
  if (!res.ok) throw new Error('Task completion failed');
  return res.json();
}

// NEW: function for task ad watch
export async function watchTaskAd(userId: number): Promise<{ 
  balance: number; 
  taskAdsWatched: number; 
  taskClaimedBonuses: number[]; 
  bonusAwarded: number;
}> {
  const res = await fetch(`${API_BASE}/api/task-ad-watch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Task ad watch failed');
  return res.json();
}

export async function requestWithdrawal(userId: number, method: string, account: string, amount: number): Promise<{ success: boolean; balance: number }> {
  const res = await fetch(`${API_BASE}/api/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, method, account, amount })
  });
  if (!res.ok) throw new Error('Withdrawal failed');
  return res.json();
}
