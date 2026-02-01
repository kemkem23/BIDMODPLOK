// In production (served from Express), use the same origin.
// In development, fall back to localhost:5000.
const isDev = process.env.NODE_ENV === 'development';

const API_BASE = process.env.REACT_APP_API_BASE ||
  (isDev ? 'http://localhost:5000/api' : `${window.location.origin}/api`);

const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_URL = process.env.REACT_APP_WS_URL ||
  (isDev ? 'ws://localhost:5000' : `${wsProtocol}//${window.location.host}`);

export { API_BASE, WS_URL };
