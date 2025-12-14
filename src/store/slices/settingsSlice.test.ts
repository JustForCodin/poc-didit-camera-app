import settingsReducer, {
  setDeviceName,
  setFrameInterval,
} from './settingsSlice';

describe('settingsSlice', () => {
  const initialState = {
    deviceName: '',
    frameInterval: 1000,
  };

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = settingsReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should have default frame interval of 1000ms', () => {
      const state = settingsReducer(undefined, { type: 'unknown' });
      expect(state.frameInterval).toBe(1000);
    });

    it('should have empty device name initially', () => {
      const state = settingsReducer(undefined, { type: 'unknown' });
      expect(state.deviceName).toBe('');
    });
  });

  describe('setDeviceName', () => {
    it('should set device name', () => {
      const state = settingsReducer(initialState, setDeviceName('Test Device'));
      expect(state.deviceName).toBe('Test Device');
    });

    it('should allow empty device name', () => {
      const stateWithName = { ...initialState, deviceName: 'Old Name' };
      const state = settingsReducer(stateWithName, setDeviceName(''));
      expect(state.deviceName).toBe('');
    });

    it('should handle special characters in device name', () => {
      const state = settingsReducer(
        initialState,
        setDeviceName("John's iPhone 15 Pro"),
      );
      expect(state.deviceName).toBe("John's iPhone 15 Pro");
    });
  });

  describe('setFrameInterval', () => {
    it('should set frame interval within valid range', () => {
      const state = settingsReducer(initialState, setFrameInterval(2000));
      expect(state.frameInterval).toBe(2000);
    });

    it('should clamp frame interval to minimum of 500ms', () => {
      const state = settingsReducer(initialState, setFrameInterval(100));
      expect(state.frameInterval).toBe(500);
    });

    it('should clamp frame interval to maximum of 5000ms', () => {
      const state = settingsReducer(initialState, setFrameInterval(10000));
      expect(state.frameInterval).toBe(5000);
    });

    it('should accept boundary value 500ms', () => {
      const state = settingsReducer(initialState, setFrameInterval(500));
      expect(state.frameInterval).toBe(500);
    });

    it('should accept boundary value 5000ms', () => {
      const state = settingsReducer(initialState, setFrameInterval(5000));
      expect(state.frameInterval).toBe(5000);
    });

    it('should handle negative values by clamping to minimum', () => {
      const state = settingsReducer(initialState, setFrameInterval(-1000));
      expect(state.frameInterval).toBe(500);
    });
  });
});
