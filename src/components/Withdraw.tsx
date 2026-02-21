import { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { requestWithdrawal } from '../api';

interface WithdrawProps {
  userId: number;
  balance: number;
  setBalance: (newBalance: number) => void;
}

export default function Withdraw({ userId, balance, setBalance }: WithdrawProps) {
  const [amount, setAmount] = useState<string>('1000');
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount < 1000) {
      setStatus('error');
      setMessage('Minimum withdrawal amount is 1000 BDT.');
      return;
    }

    if (withdrawAmount > balance) {
      setStatus('error');
      setMessage('Insufficient balance.');
      return;
    }

    if (accountNumber.length < 11) {
      setStatus('error');
      setMessage('Please enter a valid account number.');
      return;
    }

    setStatus('loading');

    try {
      const result = await requestWithdrawal(userId, method, accountNumber, withdrawAmount);
      if (result.success) {
        setBalance(result.balance);
        setStatus('success');
        setMessage(`Successfully requested ${withdrawAmount} BDT via ${method === 'bkash' ? 'bKash' : 'Nagad'}.`);
        setAmount('1000');
        setAccountNumber('');
      } else {
        setStatus('error');
        setMessage('Withdrawal request failed.');
      }
    } catch (error) {
      console.error("Withdrawal failed", error);
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Wallet className="text-green-400" /> Withdraw Funds
        </h2>
        <p className="text-gray-400 text-sm">
          Current Balance: <span className="text-green-400 font-bold">{balance.toFixed(2)} BDT</span>
        </p>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-4 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Payment Method</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMethod('bkash')}
              className={`p-3 rounded-xl border transition-all ${
                method === 'bkash' 
                  ? 'bg-pink-600/20 border-pink-500 text-pink-500' 
                  : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600'
              }`}
            >
              bKash
            </button>
            <button
              type="button"
              onClick={() => setMethod('nagad')}
              className={`p-3 rounded-xl border transition-all ${
                method === 'nagad' 
                  ? 'bg-orange-600/20 border-orange-500 text-orange-500' 
                  : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600'
              }`}
            >
              Nagad
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Account Number</label>
          <input
            type="number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="017xxxxxxxx"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Amount (Min 1000 BDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            min="1000"
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
            <AlertCircle size={16} /> {message}
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 p-3 rounded-lg">
            <CheckCircle size={16} /> {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || balance < 1000}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Processing...' : 'Withdraw Request'}
        </button>
      </form>
    </div>
  );
}
