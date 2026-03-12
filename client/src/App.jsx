import { useProfile } from './hooks/useProfile';
import { useDarkMode } from './hooks/useDarkMode';
import OnboardingPage from './components/OnboardingPage';
import DashboardPage from './components/DashboardPage';

function App() {
  const { userId, profile, loading, createProfile, updateProfile } = useProfile();
  const [dark, setDark] = useDarkMode();

  if (loading) {
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

  return <DashboardPage userId={userId} profile={profile} updateProfile={updateProfile} dark={dark} onToggleDark={() => setDark(d => !d)} />;
}

export default App;
