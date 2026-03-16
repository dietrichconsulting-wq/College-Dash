import { useState, useEffect } from 'react';
import { useProfile } from './hooks/useProfile';
import { useDarkMode } from './hooks/useDarkMode';
import OnboardingPage from './components/OnboardingPage';
import PaywallPage from './components/PaywallPage';
import DashboardPage from './components/DashboardPage';
import api from './utils/api';

function App() {
  const { userId, profile, loading, createProfile, updateProfile, setProfile } = useProfile();
  const [dark, setDark] = useDarkMode();
  const [subChecked, setSubChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Check subscription status whenever we have a userId + profile
  useEffect(() => {
    if (!userId || !profile) {
      setSubChecked(true);
      return;
    }

    api.get(`/subscription/status/${userId}`)
      .then(({ data }) => {
        setHasAccess(data.hasAccess);
        setSubChecked(true);
      })
      .catch(() => {
        setHasAccess(false);
        setSubChecked(true);
      });
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

  if (!userId || !profile) {
    return <OnboardingPage onComplete={createProfile} />;
  }

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
