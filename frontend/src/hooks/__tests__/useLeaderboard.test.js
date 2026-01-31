import { renderHook, waitFor, act } from '@testing-library/react';
import { fetchLeaderboard } from '../../services/api';
import useWebSocket from '../useWebSocket';
import useLeaderboard from '../useLeaderboard';

jest.mock('../../services/api');
jest.mock('../useWebSocket');

let capturedWsCallback;

beforeEach(() => {
  jest.clearAllMocks();
  capturedWsCallback = null;

  useWebSocket.mockImplementation((type, callback) => {
    if (type === 'leaderboard:updated') {
      capturedWsCallback = callback;
    }
  });
});

describe('useLeaderboard', () => {
  it('starts with loading=true', () => {
    fetchLeaderboard.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.loading).toBe(true);
    expect(result.current.classes).toEqual([]);
    expect(result.current.allResults).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('after successful fetch: classes and allResults are set, loading=false', async () => {
    const data = {
      classes: [{ id: 1, name: 'A' }],
      allResults: [{ id: 1, time: '1:00' }],
    };
    fetchLeaderboard.mockResolvedValue(data);

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.classes).toEqual(data.classes);
    expect(result.current.allResults).toEqual(data.allResults);
    expect(result.current.error).toBeNull();
  });

  it('on fetch error: error is set and loading=false', async () => {
    fetchLeaderboard.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Server error');
  });

  it('WebSocket callback with array updates classes', async () => {
    fetchLeaderboard.mockResolvedValue({ classes: [], allResults: [] });

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newClasses = [{ id: 2, name: 'B' }, { id: 3, name: 'C' }];

    act(() => {
      capturedWsCallback(newClasses);
    });

    expect(result.current.classes).toEqual(newClasses);
    expect(result.current.error).toBeNull();
  });

  it('WebSocket callback with non-array does NOT update classes', async () => {
    const initialClasses = [{ id: 1, name: 'A' }];
    fetchLeaderboard.mockResolvedValue({ classes: initialClasses, allResults: [] });

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      capturedWsCallback({ notAnArray: true });
    });

    // classes should remain unchanged
    expect(result.current.classes).toEqual(initialClasses);
    // error is still cleared
    expect(result.current.error).toBeNull();
  });
});
