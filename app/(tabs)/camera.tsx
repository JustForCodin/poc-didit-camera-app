/**
 * Camera Screen
 *
 * Main camera view with permission handling.
 * Shows permission request/denied UI or camera preview based on permission state.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { useAppSelector, useAppDispatch, setDeviceName } from '@/src/store';
import {
  checkCameraPermission,
  requestCameraPermission,
  openAppSettings,
  type PermissionStatus,
} from '@/src/services/camera';
import { PermissionRequest, PermissionDenied } from '@/src/components/camera';
import {
  Card,
  CardContent,
  Heading,
  BodyText,
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
  const dispatch = useAppDispatch();

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

  const handleSetDeviceName = () => {
    dispatch(setDeviceName('Test Device'));
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

  // Permission granted - show camera placeholder (actual preview in Story 2.2)
  return (
    <Container>
      <Section>
        <Heading>Vision AI Tester</Heading>
        <Caption>Camera permission granted</Caption>
      </Section>

      <CameraPlaceholder>
        <PlaceholderText>📷</PlaceholderText>
        <PlaceholderLabel>Camera Preview</PlaceholderLabel>
        <PlaceholderSubtext>
          Live preview coming in Story 2.2
        </PlaceholderSubtext>
      </CameraPlaceholder>

      <Card elevated>
        <CardContent>
          <BodyText>Device: {deviceName || 'Not set'}</BodyText>
          <Caption>Frame Interval: {frameInterval}ms</Caption>
        </CardContent>
      </Card>

      <Section>
        <ButtonContainer onPress={handleSetDeviceName}>
          <ButtonText>Set Device Name</ButtonText>
        </ButtonContainer>
      </Section>

      <Section>
        <ButtonContainer variant="secondary" disabled onPress={() => {}}>
          <ButtonText>Start Recording (Coming Soon)</ButtonText>
        </ButtonContainer>
      </Section>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
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

const Section = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const CameraPlaceholder = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  min-height: 300px;
`;

const PlaceholderText = styled.Text`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const PlaceholderLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.heading.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.heading.fontWeight};
  color: ${({ theme }) => theme.colors.background};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const PlaceholderSubtext = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
