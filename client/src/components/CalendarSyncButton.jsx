import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function CalendarSyncButton({ userId }) {
  const [status, setStatus] = useState({ connected: false, configured: false });

  useEffect(() => {
    api.get(`/auth/google/status?userId=${userId}`)
      .then(({ data }) => setStatus(data))
      .catch(() => {});
  }, [userId]);

  const handleConnect = async () => {
    try {
      const { data } = await api.get(`/auth/google?userId=${userId}`);
      window.location.href = data.url;
    } catch {
      // Not configured
    }
  };

  if (!status.configured) return null;

  if (status.connected) {
    return (
      <span className="text-xs text-success font-medium px-3 py-1.5 bg-green-50 rounded-lg">
        Google Calendar Connected
      </span>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="text-xs text-navy font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
    >
      Connect Google Calendar
    </button>
  );
}
