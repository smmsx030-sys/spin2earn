import { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Loader2 } from 'lucide-react';
import { submitSpin } from '../api';
import { useAdSonar } from '../hooks/useAdSonar';

interface SpinWheelProps {
  userId: number;
  balance: number;
  spinsLeft: number;
  onSpinComplete: (newBalance: number, newSpinsLeft: number) => void;
}

const PRIZES = [
  { amount: 1, label: '1' },
  { amount: 3, label: '3' },
  { amount: 5, label: '5' },
  { amount: 20, label: '20', visualOnly: true },
  { amount: 50, label: '50', visualOnly: true },
  { amount: 0, label: 'Try', isTry: true },
];

const SEGMENTS = 6;
const ANGLE_PER_SEGMENT = 360 / SEGMENTS;

// Distinct colors for each segment (index 0 to 5)
const SEGMENT_COLORS = [
  'bg-red-600',      // 1
  'bg-orange-500',   // 3
  'bg-yellow-500',   // 5
  'bg-green-600',    // 20 (visual only)
  'bg-blue-600',     // 50 (visual only)
  'bg-purple-600',   // Try
];

export default function SpinWheel({ userId, balance, spinsLeft, onSpinComplete }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastPrize, setLastPrize] = useState<string | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const { showRewardedAd, isReady } = useAdSonar('spin2earn');

  const getPrize = () => {
    const rand = Math.random() * 100;
    if (rand < 70) return { amount: 1, label: '1 BDT' };
    if (rand < 80) return { amount: 3, label: '3 BDT' };
    if (rand < 82) return { amount: 5, label: '5 BDT' };
    return { amount: 0, label: 'Try Again' };
  };

  const handleSpin = async () => {
    if (spinsLeft <= 0) return;

    setIsLoadingAd(true);
    try {
      if (!isReady) {
        alert("Ads service not ready. Please try again.");
        return;
      }
      const adCompleted = await showRewardedAd();
      if (!adCompleted) {
        alert("Ad was not completed. Try again.");
        return;
      }
    } catch (error) {
      console.error('Ad failed:', error);
      alert("Ad failed to load. Please try again.");
      return;
    } finally {
      setIsLoadingAd(false);
    }

    setIsSpinning(true);
    setLastPrize(null);

    const prize = getPrize();
    let targetSegment = 0;
    if (prize.amount === 1) targetSegment = 0;
    else if (prize.amount === 3) targetSegment = 1;
    else if (prize.amount === 5) targetSegment = 2;
    else targetSegment = 5;

    const baseRotation = 360 - (targetSegment * ANGLE_PER_SEGMENT) - ANGLE_PER_SEGMENT / 2;
    const extraSpins = 5 * 360;
    const randomOffset = (Math.random() - 0.5) * 20;
    const newRotation = rotation + extraSpins + baseRotation + randomOffset;
    setRotation(newRotation);

    setTimeout(async () => {
      try {
        const result = await submitSpin(userId, prize.amount);
        onSpinComplete(result.balance, result.spinsLeft);
        setLastPrize(prize.label);
        
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
    <div className="flex flex-col items-center justify-center p-4 space-y-6 w-full max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Coins className="text-yellow-400" /> Spin & Win
        </h2>
        <p className="text-gray-400 text-sm">
          Spins left today: <span className="text-white font-bold">{spinsLeft}</span>
        </p>
      </div>

      <div className="relative w-64 h-64">
        <motion.div
          className="w-full h-full rounded-full border-4 border-yellow-500 shadow-xl relative overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "circOut" }}
        >
          <div className="absolute inset-0">
            {PRIZES.map((_, index) => {
              const angle = index * ANGLE_PER_SEGMENT;
              return (
                <div
                  key={index}
                  className={`absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left ${SEGMENT_COLORS[index]}`}
                  style={{
                    transform: `rotate(${angle}deg) skewY(-${90 - ANGLE_PER_SEGMENT}deg)`,
                    borderRight: '1px solid #374151',
                  }}
                />
              );
            })}
          </div>

          {PRIZES.map((prize, index) => {
            const angle = index * ANGLE_PER_SEGMENT + ANGLE_PER_SEGMENT / 2;
            const radius = 40;
            const x = 50 + radius * Math.sin(angle * Math.PI / 180);
            const y = 50 - radius * Math.cos(angle * Math.PI / 180);
            const textColor = prize.visualOnly ? 'text-gray-400' : (prize.isTry ? 'text-gray-300' : 'text-white');
            return (
              <div
                key={`label-${index}`}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 font-bold ${textColor} ${prize.visualOnly ? 'line-through' : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  fontSize: prize.isTry ? '0.7rem' : '0.9rem',
                  textShadow: '0 0 4px black',
                }}
              >
                {prize.label}
              </div>
            );
          })}
        </motion.div>

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
