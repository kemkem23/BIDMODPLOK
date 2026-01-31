// useWebSocket.js calls connect() at module load time.
// ES imports are hoisted above variable declarations by Jest,
// so we must set up the global WebSocket mock in a beforeAll
// and use require() (not import) to control load order.

const { renderHook } = require('@testing-library/react');

const mockWs = {
  onopen: null,
  onmessage: null,
  onclose: null,
  onerror: null,
  close: jest.fn(),
  readyState: 1,
};

// Set up before any module that uses WebSocket is loaded
global.WebSocket = jest.fn(() => mockWs);
global.WebSocket.OPEN = 1;
global.WebSocket.CONNECTING = 0;

// Now require the module (connect() runs here)
const useWebSocket = require('../useWebSocket').default;

describe('useWebSocket', () => {
  it('invokes callback when a matching message type is received', () => {
    const callback = jest.fn();
    renderHook(() => useWebSocket('race:updated', callback));

    // connect() was called at module load and set ws.onmessage
    const message = { type: 'race:updated', data: { id: 1 } };
    mockWs.onmessage({ data: JSON.stringify(message) });

    expect(callback).toHaveBeenCalledWith({ id: 1 });
  });

  it('does NOT invoke callback for a non-matching message type', () => {
    const callback = jest.fn();
    renderHook(() => useWebSocket('race:updated', callback));

    const message = { type: 'leaderboard:updated', data: [1, 2, 3] };
    mockWs.onmessage({ data: JSON.stringify(message) });

    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up listener on unmount', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useWebSocket('race:updated', callback));

    unmount();

    const message = { type: 'race:updated', data: { id: 99 } };
    mockWs.onmessage({ data: JSON.stringify(message) });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not throw on malformed JSON messages', () => {
    const callback = jest.fn();
    renderHook(() => useWebSocket('race:updated', callback));

    expect(() => {
      mockWs.onmessage({ data: '{{not json' });
    }).not.toThrow();

    expect(callback).not.toHaveBeenCalled();
  });
});
