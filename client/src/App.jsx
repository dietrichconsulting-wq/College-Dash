import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { useDarkMode } from './hooks/useDarkMode';
import AuthPage from './components/AuthPage';
import AccountTypeSelector from './components/AccountTypeSelector';
import OnboardingPage from './components/OnboardingPage';
import ParentOnboardingPage from './components/ParentOnboardingPage';
import PaywallPage from './components/PaywallPage';
import DashboardPage from './components/DashboardPage';
import ParentDashboard from './components/ParentDashboard';
import api from './utils/api';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { userId, profile, loading: profileLoading, createProfile, updateProfile, setProfile } = useProfile(user?.id);
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

  // ── Loading spinner ──
  if (authLoading || profileLoading || !subChecked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated: show sign-in / sign-up ──
  if (!user) {
    return <AuthPage signIn={signIn} signUp={signUp} />;
  }

  // ── Authenticated but no profile yet: onboarding ──
  if (!profile) {
    if (!accountTypeChoice) {
      return <AccountTypeSelector onSelect={setAccountTypeChoice} />;
    }

    if (accountTypeChoice === 'parent') {
      return (
        <ParentOnboardingPage
          authUserId={user.id}
          onComplete={(parentProfile) => {
            setProfile(parentProfile);
            setHasAccess(true);
          }}
        />
      );
    }

    return <OnboardingPage onComplete={createProfile} />;
  }

  // ── Parent account ──
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
              onClick={signOut}
              className="text-sm text-navy hover:underline"
            >
              Sign out
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
        onSignOut={signOut}
      />
    );
  }

  // ── Student account: paywall + dashboard ──
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
      onSignOut={signOut}
    />
  );
}

export default App;
