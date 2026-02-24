import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Sonar?: {
      show: (options: { adUnit: string }) => Promise<boolean> | void;
    };
  }
}

export const useAdSonar = (adUnitName: string = 'spin2earn') => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkSonar = () => {
      if (window.Sonar && typeof window.Sonar.show === 'function') {
        setIsReady(true);
      } else {
        setTimeout(checkSonar, 500);
      }
    };
    checkSonar();
  }, []);

  const showRewardedAd = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isReady) {
        console.error('AdSonar not ready');
        resolve(false);
        return;
      }

      try {
        const result = window.Sonar!.show({ adUnit: adUnitName });

        if (result instanceof Promise) {
          result
            .then(() => {
              console.log('Ad completed successfully');
              resolve(true);
            })
            .catch((error) => {
              console.error('Ad failed:', error);
              resolve(false);
            });
        } else {
          // Listen for a custom reward event (most SDKs dispatch one)
          const onReward = () => {
            console.log('Ad reward event received');
            resolve(true);
            document.removeEventListener('adsonar_reward', onReward);
          };
          document.addEventListener('adsonar_reward', onReward);

          // Fallback timeout in case the event never fires
          setTimeout(() => {
            console.warn('AdSonar: no reward event received, assuming ad completed');
            document.removeEventListener('adsonar_reward', onReward);
            resolve(true);
          }, 5000);
        }
      } catch (error) {
        console.error('Error showing ad:', error);
        resolve(false);
      }
    });
  };

  return { showRewardedAd, isReady };
};
