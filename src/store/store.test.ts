import { createTestStore } from './store';
import { setDeviceName, setFrameInterval } from './slices';

describe('Redux Store', () => {
  describe('rootReducer', () => {
    it('should have settings slice in initial state', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state).toHaveProperty('settings');
    });

    it('should have correct initial settings state', () => {
      const store = createTestStore();
      const state = store.getState();
      expect(state.settings.deviceName).toBe('');
      expect(state.settings.frameInterval).toBe(1000);
    });
  });

  describe('dispatch actions', () => {
    it('should dispatch setDeviceName action', () => {
      const store = createTestStore();
      store.dispatch(setDeviceName('Integration Test Device'));
      const state = store.getState();
      expect(state.settings.deviceName).toBe('Integration Test Device');
    });

    it('should dispatch setFrameInterval action', () => {
      const store = createTestStore();
      store.dispatch(setFrameInterval(2500));
      const state = store.getState();
      expect(state.settings.frameInterval).toBe(2500);
    });

    it('should not affect other store instances', () => {
      const store1 = createTestStore();
      const store2 = createTestStore();

      store1.dispatch(setDeviceName('Store 1 Device'));

      expect(store1.getState().settings.deviceName).toBe('Store 1 Device');
      expect(store2.getState().settings.deviceName).toBe(''); // Unaffected
    });
  });

  describe('preloaded state', () => {
    it('should accept preloaded state', () => {
      const store = createTestStore({
        settings: {
          deviceName: 'Preloaded Device',
          frameInterval: 2000,
        },
      });
      const state = store.getState();
      expect(state.settings.deviceName).toBe('Preloaded Device');
      expect(state.settings.frameInterval).toBe(2000);
    });
  });

  describe('type exports', () => {
    it('should export RootState type that matches store state', () => {
      const store = createTestStore();
      const state = store.getState();
      const deviceName: string = state.settings.deviceName;
      const frameInterval: number = state.settings.frameInterval;
      expect(typeof deviceName).toBe('string');
      expect(typeof frameInterval).toBe('number');
    });
  });
});
