import { useEffect, useRef } from 'react';
import { WS_URL } from '../config';

const listeners = new Map();
let ws = null;
let reconnectTimer = null;

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('[WS] Connected');
  };

  ws.onmessage = (event) => {
    try {
      const { type, data } = JSON.parse(event.data);
      const callbacks = listeners.get(type);
      if (callbacks) {
        callbacks.forEach(cb => cb(data));
      }
    } catch (err) {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    console.log('[WS] Disconnected, reconnecting in 2s...');
    ws = null;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 2000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

// Start connection immediately on module load
connect();

export default function useWebSocket(type, callback) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (data) => savedCallback.current(data);

    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type).add(handler);

    // Ensure connection is alive
    connect();

    return () => {
      const callbacks = listeners.get(type);
      if (callbacks) {
        callbacks.delete(handler);
        if (callbacks.size === 0) listeners.delete(type);
      }
    };
  }, [type]);
}
