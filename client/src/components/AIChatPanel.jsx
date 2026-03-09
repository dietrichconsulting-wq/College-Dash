import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function AIChatPanel({ open, onClose, messages, loading, onSend }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="px-4 py-3 bg-navy text-white flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold"
                  style={{ fontSize: 'var(--font-size-body)' }}
                >
                  AI College Advisor
                </h3>
                <p
                  className="text-blue-200"
                  style={{ fontSize: 'var(--font-size-micro)' }}
                >
                  Ask about portfolios & scholarships
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white text-lg transition-colors"
              >
                x
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="text-center text-text-muted mt-8">
                  <p
                    className="font-medium mb-2"
                    style={{ fontSize: 'var(--font-size-body)' }}
                  >
                    Welcome to your AI College Advisor!
                  </p>
                  <p style={{ fontSize: 'var(--font-size-micro)' }}>Try asking:</p>
                  <div className="mt-3 space-y-2">
                    {[
                      'What portfolio pieces should I include for CS?',
                      'What scholarships match my profile?',
                      'How can I strengthen my application?',
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => onSend(q)}
                        className="block w-full text-left bg-blue-50 text-navy px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        style={{ fontSize: 'var(--font-size-micro)' }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <ChatMessage key={i} message={m} />
              ))}
              {loading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <ChatInput onSend={onSend} disabled={loading} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
