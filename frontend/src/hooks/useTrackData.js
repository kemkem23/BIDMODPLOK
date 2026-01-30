import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentRace } from '../services/api';
import useWebSocket from './useWebSocket';

function useTrackData() {
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCurrentRace();
        if (!cancelled) {
          setRace(data.currentRace);
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

  const handleRaceUpdate = useCallback((data) => {
    setRace(data);
    setError(null);
  }, []);

  useWebSocket('race:updated', handleRaceUpdate);

  return { race, loading, error };
}

export default useTrackData;
