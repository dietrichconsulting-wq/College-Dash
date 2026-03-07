import { motion } from 'framer-motion';
import ProfileForm from './ProfileForm';

export default function OnboardingPage({ onComplete }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-blue-400 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">College Dashboard</h1>
          <p className="text-text-muted">Set up your profile to get started on your college journey</p>
        </div>
        <ProfileForm onSubmit={onComplete} />
      </motion.div>
    </div>
  );
}
