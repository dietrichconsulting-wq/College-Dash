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
      const status = err.response?.status;
      const userMessage =
        status === 503 ? 'The AI advisor is temporarily unavailable. Please try again in a moment.' :
        status === 429 ? 'Too many requests — please wait a moment before sending another message.' :
        !err.response ? 'Couldn\'t reach the server. Check your connection and try again.' :
        'Something went wrong. Please try again.';
      const errorMsg = { role: 'assistant', content: userMessage, isError: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, loading, sendMessage, clearMessages };
}
