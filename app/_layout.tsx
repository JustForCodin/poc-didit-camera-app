import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components/native';
import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';
import {
  store,
  persistor,
  useAppDispatch,
  setSession,
  clearSession,
  setAuthStatus,
  setAuthError,
} from '@/src/store';
import { theme } from '@/src/theme';
import { initializeAuth, onAuthStateChange } from '@/src/services/supabase';

/**
 * Loading container for auth initialization
 */
const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.surface};
`;

// Enable Redux DevTools in development
if (__DEV__) {
  require('redux-devtools-expo-dev-plugin');
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

/**
 * AuthInitializer component handles authentication on app launch.
 * - Checks for existing session on mount
 * - Creates anonymous user if no session exists (first launch)
 * - Listens for auth state changes
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize auth on mount
    dispatch(setAuthStatus('loading'));

    initializeAuth().then((result) => {
      if (result.success && result.data) {
        const session = result.data;
        dispatch(
          setSession({
            user: session.user,
            session,
          })
        );
      } else if (result.success && !result.data) {
        // No session and no error - user is not authenticated
        dispatch(clearSession());
      } else if (!result.success) {
        // Auth failed - but app can still work offline
        dispatch(setAuthError(result.error));
      }
      setIsInitializing(false);
    });

    // Listen for auth state changes (e.g., token refresh, sign out)
    const unsubscribe = onAuthStateChange((session) => {
      if (session) {
        dispatch(
          setSession({
            user: session.user,
            session,
          })
        );
      } else {
        dispatch(clearSession());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // Show loading indicator while initializing auth
  if (isInitializing) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </LoadingContainer>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <AuthInitializer>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </AuthInitializer>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
