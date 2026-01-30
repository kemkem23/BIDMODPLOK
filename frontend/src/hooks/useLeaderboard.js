import { useState, useEffect, useCallback } from 'react';
import { fetchLeaderboard } from '../services/api';
import useWebSocket from './useWebSocket';

function useLeaderboard() {
  const [classes, setClasses] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchLeaderboard();
        if (!cancelled) {
          setClasses(data.classes || []);
          setAllResults(data.allResults || []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleLeaderboardUpdate = useCallback((data) => {
    if (Array.isArray(data)) {
      setClasses(data);
    }
    setError(null);
  }, []);

  useWebSocket('leaderboard:updated', handleLeaderboardUpdate);

  return { classes, allResults, loading, error };
}

export default useLeaderboard;
