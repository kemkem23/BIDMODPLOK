import { renderHook, waitFor, act } from '@testing-library/react';
import { fetchCurrentRace } from '../../services/api';
import useWebSocket from '../useWebSocket';
import useTrackData from '../useTrackData';

jest.mock('../../services/api');
jest.mock('../useWebSocket');

let capturedWsCallback;

beforeEach(() => {
  jest.clearAllMocks();
  capturedWsCallback = null;

  useWebSocket.mockImplementation((type, callback) => {
    if (type === 'race:updated') {
      capturedWsCallback = callback;
    }
  });
});

describe('useTrackData', () => {
  it('starts with loading=true', () => {
    fetchCurrentRace.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTrackData());

    expect(result.current.loading).toBe(true);
    expect(result.current.race).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('after successful fetch: race is set and loading=false', async () => {
    const raceData = { id: 1, name: 'Race 1' };
    fetchCurrentRace.mockResolvedValue({ currentRace: raceData });

    const { result } = renderHook(() => useTrackData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.race).toEqual(raceData);
    expect(result.current.error).toBeNull();
  });

  it('on fetch error: error is set and loading=false', async () => {
    fetchCurrentRace.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useTrackData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network failure');
    expect(result.current.race).toBeNull();
  });

  it('WebSocket callback updates race', async () => {
    const initialRace = { id: 1, name: 'Race 1' };
    fetchCurrentRace.mockResolvedValue({ currentRace: initialRace });

    const { result } = renderHook(() => useTrackData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.race).toEqual(initialRace);

    const updatedRace = { id: 1, name: 'Race 1 Updated' };
    act(() => {
      capturedWsCallback(updatedRace);
    });

    expect(result.current.race).toEqual(updatedRace);
    expect(result.current.error).toBeNull();
  });

  it('cleanup cancels async state updates after unmount', async () => {
    let resolvePromise;
    fetchCurrentRace.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result, unmount } = renderHook(() => useTrackData());

    expect(result.current.loading).toBe(true);

    unmount();

    await act(async () => {
      resolvePromise({ currentRace: { id: 99 } });
    });
  });
});
