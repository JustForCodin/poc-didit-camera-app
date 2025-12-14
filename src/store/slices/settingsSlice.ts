import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  deviceName: string;
  frameInterval: number; // milliseconds (500-5000)
}

const initialState: SettingsState = {
  deviceName: '',
  frameInterval: 1000, // Default: 1 frame per second
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDeviceName: (state, action: PayloadAction<string>) => {
      state.deviceName = action.payload;
    },
    setFrameInterval: (state, action: PayloadAction<number>) => {
      state.frameInterval = Math.min(Math.max(action.payload, 500), 5000);
    },
  },
});

export const { setDeviceName, setFrameInterval } = settingsSlice.actions;
export default settingsSlice.reducer;
