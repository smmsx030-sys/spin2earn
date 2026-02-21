import express from "express";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory database for demo purposes
  const users: Record<string, any> = {};

  const getUser = (id: string) => {
    if (!users[id]) {
      users[id] = {
        userId: parseInt(id),
        balance: 0,
        lifetimeEarnings: 0,
        spinsLeft: 10, // Changed from 5 to 10
        referralCount: 0,
        referralLink: `https://t.me/spin2earnn_bot?start=ref_${id}`,
        lastSpinDate: new Date().toDateString(),
        adsWatched: 0,
        claimedBonuses: [] // Array of milestone numbers (e.g., [5, 15])
      };
    }
    
    // Reset daily spins if needed
    const today = new Date().toDateString();
    if (users[id].lastSpinDate !== today) {
      users[id].spinsLeft = 10; // Changed from 5 to 10
      users[id].lastSpinDate = today;
    }
    
    return users[id];
  };

  // Generate some mock users for leaderboard
  if (Object.keys(users).length === 0) {
    const mockUsers = [
      { id: '101', name: 'Alice', balance: 1200, lifetimeEarnings: 5000, referralCount: 12 },
      { id: '102', name: 'Bob', balance: 800, lifetimeEarnings: 3200, referralCount: 5 },
      { id: '103', name: 'Charlie', balance: 2500, lifetimeEarnings: 8000, referralCount: 25 },
      { id: '104', name: 'David', balance: 150, lifetimeEarnings: 450, referralCount: 1 },
      { id: '105', name: 'Eve', balance: 3000, lifetimeEarnings: 9500, referralCount: 40 },
    ];
    
    mockUsers.forEach(u => {
      users[u.id] = {
        userId: parseInt(u.id),
        balance: u.balance,
        lifetimeEarnings: u.lifetimeEarnings,
        spinsLeft: 0,
        referralCount: u.referralCount,
        referralLink: `https://t.me/spin2earnn_bot?start=ref_${u.id}`,
        lastSpinDate: new Date().toDateString(),
        adsWatched: Math.floor(Math.random() * 50),
        claimedBonuses: [],
        name: u.name // Storing name for leaderboard display
      };
    });
  }

  // API Routes
  app.get("/api/user/:id", (req, res) => {
    const user = getUser(req.params.id);
    res.json(user);
  });

  app.get("/api/leaderboard", (req, res) => {
    const allUsers = Object.values(users);
    
    const topEarners = [...allUsers]
      .sort((a, b) => b.lifetimeEarnings - a.lifetimeEarnings)
      .slice(0, 10)
      .map(u => ({ userId: u.userId, name: u.name || `User ${u.userId}`, amount: u.lifetimeEarnings }));
      
    const topReferrers = [...allUsers]
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 10)
      .map(u => ({ userId: u.userId, name: u.name || `User ${u.userId}`, count: u.referralCount }));
      
    res.json({ topEarners, topReferrers });
  });

  app.post("/api/spin", (req, res) => {
    const { userId, prizeAmount } = req.body;
    const user = getUser(userId.toString());
    
    if (user.spinsLeft > 0) {
      user.spinsLeft -= 1;
      user.balance += prizeAmount;
      user.lifetimeEarnings += prizeAmount;
      user.adsWatched += 1;
      
      // Check for bonuses
      let bonusAwarded = 0;
      const milestones = [
        { ads: 5, reward: 10 },
        { ads: 15, reward: 40 },
        { ads: 30, reward: 99 },
        { ads: 50, reward: 180 },
        { ads: 100, reward: 380 }
      ];
      
      milestones.forEach(m => {
        if (user.adsWatched >= m.ads && !user.claimedBonuses.includes(m.ads)) {
          user.balance += m.reward;
          user.lifetimeEarnings += m.reward;
          user.claimedBonuses.push(m.ads);
          bonusAwarded += m.reward;
        }
      });

      res.json({ 
        balance: user.balance, 
        spinsLeft: user.spinsLeft,
        adsWatched: user.adsWatched,
        bonusAwarded
      });
    } else {
      res.status(400).json({ error: "No spins left" });
    }
  });

  app.post("/api/task-complete", (req, res) => {
    const { userId, rewardAmount } = req.body;
    const user = getUser(userId.toString());
    user.balance += rewardAmount;
    user.lifetimeEarnings += rewardAmount;
    res.json({ balance: user.balance });
  });

  app.post("/api/withdraw", (req, res) => {
    const { userId, amount } = req.body;
    const user = getUser(userId.toString());
    
    if (user.balance >= amount && amount >= 1000) {
      user.balance -= amount;
      res.json({ success: true, balance: user.balance });
    } else {
      res.status(400).json({ error: "Invalid withdrawal" });
    }
  });

  // Vite middleware for development
  // In AI Studio preview, we treat it as development
  if (process.env.NODE_ENV !== "production" || process.env.VITE_DEV_SERVER === "true") {
    console.log("Attaching Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production mode: Expecting static files in dist/");
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();