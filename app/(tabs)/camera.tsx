/**
 * Camera Screen
 *
 * Main camera view with permission handling.
 * Shows permission request/denied UI or camera preview based on permission state.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useAppSelector } from '@/src/store';
import {
  checkCameraPermission,
  requestCameraPermission,
  openAppSettings,
  type PermissionStatus,
} from '@/src/services/camera';
import { PermissionRequest, PermissionDenied, CameraPreview } from '@/src/components/camera';
import {
  Card,
  CardContent,
  Heading,
  Caption,
  ButtonContainer,
  ButtonText,
} from '@/src/components/styled';

export default function CameraScreen() {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const deviceName = useAppSelector((state) => state.settings.deviceName);
  const frameInterval = useAppSelector(
    (state) => state.settings.frameInterval
  );

  const checkPermission = useCallback(async () => {
    const result = await checkCameraPermission();
    if (result.success) {
      setPermissionStatus(result.data);
    }
    setIsLoading(false);
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check when app returns from background (user may have changed settings)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [checkPermission]);

  const handleRequestPermission = async () => {
    const result = await requestCameraPermission();
    if (result.success) {
      setPermissionStatus(result.data);
    }
  };

  const handleOpenSettings = async () => {
    await openAppSettings();
  };

  // Loading state
  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" />
        <LoadingText>Checking camera permission...</LoadingText>
      </LoadingContainer>
    );
  }

  // Permission not yet requested
  if (permissionStatus === 'undetermined') {
    return <PermissionRequest onRequestPermission={handleRequestPermission} />;
  }

  // Permission denied or restricted
  if (permissionStatus === 'denied' || permissionStatus === 'restricted') {
    return <PermissionDenied onOpenSettings={handleOpenSettings} />;
  }

  // Permission granted - show live camera preview
  return (
    <Container>
      <Header>
        <Heading>Vision AI Tester</Heading>
        <Caption>Device: {deviceName || 'Not set'}</Caption>
      </Header>

      <PreviewWrapper>
        <CameraPreview
          isActive={true}
          facing="back"
          testID="main-camera-preview"
        />
      </PreviewWrapper>

      <ControlsSection>
        <Card>
          <CardContent>
            <Caption>Frame Interval: {frameInterval}ms</Caption>
          </CardContent>
        </Card>

        <ButtonContainer variant="secondary" disabled onPress={() => {}}>
          <ButtonText>Start Recording (Coming Soon)</ButtonText>
        </ButtonContainer>
      </ControlsSection>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const PreviewWrapper = styled.View`
  flex: 1;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ControlsSection = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoadingText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;
