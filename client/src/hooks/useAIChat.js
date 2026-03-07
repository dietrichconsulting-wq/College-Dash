import { useState } from 'react';
import api from '../utils/api';

export function useAIChat(userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content) => {
    const userMsg = { role: 'user', content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { userId, messages: updatedMessages });
      const assistantMsg = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: err.response?.data?.error || 'Sorry, something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, loading, sendMessage, clearMessages };
}
