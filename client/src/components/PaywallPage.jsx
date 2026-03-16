import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function PaywallPage({ userId, profile, onSubscriptionActivated }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/subscription/create-checkout', { userId });
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(false);
    }
  };

  const handlePromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setLoading(true);
    try {
      const { data } = await api.post('/subscription/promo', { userId, promoCode });
      onSubscriptionActivated(data);
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Invalid promo code');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = profile.subscriptionStatus === 'expired' || profile.subscriptionStatus === 'cancelled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isExpired ? 'Your trial has ended' : `Welcome, ${profile.displayName}!`}
        </h1>
        <p className="text-gray-500 mb-6">
          {isExpired
            ? 'Subscribe to keep using your College Dashboard.'
            : 'Start your 7-day free trial to access your College Dashboard.'}
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
          <p className="text-4xl font-bold text-gray-900">
            $9.99<span className="text-base font-normal text-gray-500">/month</span>
          </p>
          {!isExpired && (
            <p className="text-sm text-gray-500 mt-1">7-day free trial included</p>
          )}
          <ul className="text-sm text-gray-600 mt-4 space-y-1.5 text-left">
            <li>&#10003; Personalized college dashboard</li>
            <li>&#10003; AI-powered strategy & advice</li>
            <li>&#10003; Scholarship tracker</li>
            <li>&#10003; School comparison tools</li>
            <li>&#10003; Task management & timeline</li>
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mb-4 cursor-pointer"
        >
          {loading ? 'Redirecting...' : isExpired ? 'Subscribe Now' : 'Start Free Trial'}
        </button>

        {!showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-sm text-blue-600 underline hover:text-blue-700 cursor-pointer"
          >
            Have a promo code?
          </button>
        ) : (
          <form onSubmit={handlePromo} className="mt-4 space-y-3">
            <input
              type="text"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {promoError && <p className="text-red-500 text-sm">{promoError}</p>}
            <button
              type="submit"
              disabled={loading || !promoCode}
              className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Apply Code
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
