import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { settingsReducer, authReducer } from './slices';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: authReducer,
  // Future slices: sessions, backends, queue
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // auth NOT included - Supabase handles session persistence
  // blacklist: ['backends'], // Credentials handled separately via secure store
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

/**
 * Creates a fresh store instance for testing (without persistence)
 * Use this in tests to avoid state pollution between tests
 */
export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState,
  });
}
