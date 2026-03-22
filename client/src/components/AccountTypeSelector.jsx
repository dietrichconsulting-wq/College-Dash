import { motion } from 'framer-motion';

export default function AccountTypeSelector({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-blue-400 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Stairway U</h1>
          <p className="text-text-muted">I am a...</p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelect('student')}
            className="group relative overflow-hidden rounded-xl border-2 border-navy/20 p-6 text-left transition-all hover:border-navy hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy, #1e3a5f)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">Student</h2>
                <p className="text-sm text-text-muted">I'm applying to college and want to track my journey</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('parent')}
            className="group relative overflow-hidden rounded-xl border-2 border-navy/20 p-6 text-left transition-all hover:border-navy hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy, #1e3a5f)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">Parent / Guardian</h2>
                <p className="text-sm text-text-muted">I want to follow my student's college application progress</p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs text-text-muted mt-6">
          Parent accounts are included free with your student's subscription.
        </p>
      </motion.div>
    </div>
  );
}
