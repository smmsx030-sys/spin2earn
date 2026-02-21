import { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Loader2 } from 'lucide-react';
import { submitSpin } from '../api';

interface SpinWheelProps {
  userId: number;
  balance: number;
  spinsLeft: number;
  onSpinComplete: (newBalance: number, newSpinsLeft: number) => void;
}

const PRIZES = [
  { amount: 1, probability: 0.70, label: '1 BDT' },
  { amount: 3, probability: 0.10, label: '3 BDT' },
  { amount: 5, probability: 0.02, label: '5 BDT' },
  { amount: 20, probability: 0, label: '20 BDT' }, // Visual only
  { amount: 50, probability: 0, label: '50 BDT' }, // Visual only
  { amount: 0, probability: 0.18, label: 'Try Again' },
];

export default function SpinWheel({ userId, balance, spinsLeft, onSpinComplete }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastPrize, setLastPrize] = useState<string | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  const getPrize = () => {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const prize of PRIZES) {
      cumulativeProbability += prize.probability;
      if (rand < cumulativeProbability) {
        return prize;
      }
    }
    return PRIZES[PRIZES.length - 1];
  };

  const handleSpin = async () => {
    if (spinsLeft <= 0) return;

    setIsLoadingAd(true);

    try {
      // Check if running in Telegram environment
      const isTelegram = !!window.Telegram?.WebApp?.initData;
      
      if (isTelegram && window.Adsgram) {
        // ✅ Updated block ID to 23391 (your new ad block)
        const AdController = window.Adsgram.init({ blockId: '23391', debug: true });
        await AdController.show();
      } else {
        // Fallback for development/browser preview
        console.log('Not in Telegram or Adsgram not loaded. Simulating ad view...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3s ad
      }
    } catch (error) {
      console.error('Ad failed to show:', error);
      // If ad fails (e.g. no fill), we still allow the user to spin in this demo
      // In production, you might want to show an error message
    } finally {
      setIsLoadingAd(false);
    }

    setIsSpinning(true);
    setLastPrize(null);

    // Determine prize locally for animation, then sync with server
    const prize = getPrize();
    
    // Calculate rotation
    const newRotation = rotation + 1080 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(async () => {
      try {
        const result = await submitSpin(userId, prize.amount);
        onSpinComplete(result.balance, result.spinsLeft);
        setLastPrize(prize.amount > 0 ? `You won ${prize.label}!` : 'Better luck next time!');
        
        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred(prize.amount > 0 ? 'success' : 'warning');
        }
      } catch (error) {
        console.error("Spin submission failed", error);
        setLastPrize("Error recording spin. Please try again.");
      } finally {
        setIsSpinning(false);
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-8 w-full max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Coins className="text-yellow-400" /> Spin & Win
        </h2>
        <p className="text-gray-400 text-sm">
          Spins left today: <span className="text-white font-bold">{spinsLeft}</span>
        </p>
      </div>

      <div className="relative w-64 h-64">
        {/* Wheel Background */}
        <motion.div
          className="w-full h-full rounded-full border-4 border-yellow-500 bg-gray-800 relative overflow-hidden shadow-xl"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "circOut" }}
        >
          {/* Simple segments visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-gray-600 absolute rotate-0"></div>
            <div className="w-full h-0.5 bg-gray-600 absolute rotate-45"></div>
            <div className="w-full h-0.5 bg-gray-600 absolute rotate-90"></div>
            <div className="w-full h-0.5 bg-gray-600 absolute rotate-135"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
            🎡
          </div>
        </motion.div>
        
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-red-500 z-10">
          ▼
        </div>
      </div>

      {lastPrize && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-yellow-500/30 text-yellow-400 px-6 py-3 rounded-xl font-bold text-lg shadow-lg"
        >
          {lastPrize}
        </motion.div>
      )}

      <button
        onClick={handleSpin}
        disabled={isSpinning || spinsLeft <= 0 || isLoadingAd}
        className={`
          w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95
          flex items-center justify-center gap-2
          ${spinsLeft <= 0 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-400 hover:to-orange-500'}
        `}
      >
        {isLoadingAd ? (
          <>
            <Loader2 className="animate-spin" /> Loading Ad...
          </>
        ) : spinsLeft <= 0 ? (
          'No Spins Left Today'
        ) : (
          <>
            📺 Watch Ad & Spin
          </>
        )}
      </button>
    </div>
  );
}
