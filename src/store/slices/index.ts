// Redux slices index
// Export all slices for easy import

export { default as settingsReducer, setDeviceName, setFrameInterval } from './settingsSlice';

export {
  default as authReducer,
  setSession,
  clearSession,
  setAuthStatus,
  setAuthError,
  selectIsAuthenticated,
  selectUser,
  selectSession,
  selectIsAnonymous,
  selectAuthStatus,
  selectAuthError,
  selectAuthIsLoading,
} from './authSlice';

export type { AuthState, AuthStatus } from './authSlice';

export {
  default as recordingReducer,
  startRecordingRequest,
  startRecordingSuccess,
  updateDuration,
  stopRecordingRequest,
  stopRecordingSuccess,
  setRecordingError,
  resetRecording,
  clearLastResult,
  selectRecordingState,
  selectIsRecording,
  selectRecordingStartedAt,
  selectRecordingDuration,
  selectLastRecordingResult,
  selectRecordingError,
  selectRecordingIsLoading,
} from './recordingSlice';

export type { RecordingSliceState } from './recordingSlice';

// Future slices will be added here:
// export { default as sessionsReducer } from './sessionsSlice';
// export { default as backendsReducer } from './backendsSlice';
// export { default as queueReducer } from './queueSlice';
