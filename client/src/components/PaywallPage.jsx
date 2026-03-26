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
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card-elevated rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {isExpired ? 'Your trial has ended' : `Welcome, ${profile.displayName}!`}
        </h1>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {isExpired
            ? 'Subscribe to keep using your College Dashboard.'
            : 'Start your 7-day free trial to access your College Dashboard.'}
        </p>

        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--color-column)', border: '1px solid var(--color-border)' }}>
          <p className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
            $9.99<span className="text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>/month</span>
          </p>
          {!isExpired && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>7-day free trial included</p>
          )}
          <ul className="text-sm mt-4 space-y-1.5 text-left" style={{ color: 'var(--color-text-muted)' }}>
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
          className="w-full py-3 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors mb-4 cursor-pointer"
          style={{ background: 'var(--color-primary)', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Redirecting...' : isExpired ? 'Subscribe Now' : 'Start Free Trial'}
        </button>

        {!showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-sm underline cursor-pointer"
            style={{ color: 'var(--color-accent-text, var(--color-primary))' }}
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
              className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2"
              style={{ background: 'var(--color-column)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            {promoError && <p className="text-sm" style={{ color: 'var(--color-danger, #EF4444)' }}>{promoError}</p>}
            <button
              type="submit"
              disabled={loading || !promoCode}
              className="w-full py-2.5 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
              style={{ background: 'var(--color-success)' }}
            >
              Apply Code
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
