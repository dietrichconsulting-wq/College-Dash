import { useState, useEffect } from 'react';
import { useProfile } from './hooks/useProfile';
import { useDarkMode } from './hooks/useDarkMode';
import AccountTypeSelector from './components/AccountTypeSelector';
import OnboardingPage from './components/OnboardingPage';
import ParentOnboardingPage from './components/ParentOnboardingPage';
import PaywallPage from './components/PaywallPage';
import DashboardPage from './components/DashboardPage';
import ParentDashboard from './components/ParentDashboard';
import api from './utils/api';

function App() {
  const { userId, profile, loading, createProfile, updateProfile, setProfile } = useProfile();
  const [dark, setDark] = useDarkMode();
  const [subChecked, setSubChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [accountTypeChoice, setAccountTypeChoice] = useState(null);

  // Check subscription status for students, or parent access for parents
  useEffect(() => {
    if (!userId || !profile) {
      setSubChecked(true);
      return;
    }

    if (profile.accountType === 'parent') {
      // Parents ride on student's subscription
      api.get(`/parent/access/${userId}`)
        .then(({ data }) => {
          setHasAccess(data.hasAccess);
          setSubChecked(true);
        })
        .catch(() => {
          setHasAccess(false);
          setSubChecked(true);
        });
    } else {
      // Students check their own subscription
      api.get(`/subscription/status/${userId}`)
        .then(({ data }) => {
          setHasAccess(data.hasAccess);
          setSubChecked(true);
        })
        .catch(() => {
          setHasAccess(false);
          setSubChecked(true);
        });
    }
  }, [userId, profile]);

  // Handle return from Stripe Checkout (success_url has ?session_id=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id') && userId) {
      const poll = setInterval(() => {
        api.get(`/subscription/status/${userId}`).then(({ data }) => {
          if (data.hasAccess) {
            setHasAccess(true);
            setSubChecked(true);
            clearInterval(poll);
            window.history.replaceState({}, '', '/');
          }
        });
      }, 2000);
      setTimeout(() => clearInterval(poll), 30000);
      return () => clearInterval(poll);
    }
  }, [userId]);

  if (loading || !subChecked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ── No account yet: show account type selector, then onboarding ──
  if (!userId || !profile) {
    // Step 1: Choose account type
    if (!accountTypeChoice) {
      return <AccountTypeSelector onSelect={setAccountTypeChoice} />;
    }

    // Step 2a: Parent onboarding
    if (accountTypeChoice === 'parent') {
      return (
        <ParentOnboardingPage
          onComplete={(parentProfile) => {
            localStorage.setItem('userId', parentProfile.userId);
            setProfile(parentProfile);
            setHasAccess(true); // Will be re-checked by useEffect
          }}
        />
      );
    }

    // Step 2b: Student onboarding (existing flow)
    return <OnboardingPage onComplete={createProfile} />;
  }

  // ── Parent account: show parent dashboard or inactive message ──
  if (profile.accountType === 'parent') {
    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="bg-surface rounded-2xl shadow-xl p-8 max-w-md text-center">
            <h2 className="text-xl font-bold text-text mb-3">Subscription Inactive</h2>
            <p className="text-text-muted mb-4">
              Your student's subscription is not currently active. Parent access requires an active student subscription.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('userId');
                window.location.reload();
              }}
              className="text-sm text-navy hover:underline"
            >
              Sign in with a different account
            </button>
          </div>
        </div>
      );
    }

    return (
      <ParentDashboard
        parentId={userId}
        dark={dark}
        onToggleDark={() => setDark(d => !d)}
      />
    );
  }

  // ── Student account: existing paywall + dashboard flow ──
  if (!hasAccess) {
    return (
      <PaywallPage
        userId={userId}
        profile={profile}
        onSubscriptionActivated={(updatedProfile) => {
          setProfile(updatedProfile);
          setHasAccess(true);
        }}
      />
    );
  }

  return (
    <DashboardPage
      userId={userId}
      profile={profile}
      updateProfile={updateProfile}
      dark={dark}
      onToggleDark={() => setDark(d => !d)}
    />
  );
}

export default App;
