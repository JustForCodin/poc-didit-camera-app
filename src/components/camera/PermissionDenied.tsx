/**
 * Permission Denied Component
 *
 * Displayed when camera permission has been denied.
 * Provides helpful message and link to device Settings.
 */

import React from 'react';
import styled from 'styled-components/native';

interface PermissionDeniedProps {
  onOpenSettings: () => void;
}

/**
 * Permission denied UI for denied/restricted camera permission state
 *
 * @param onOpenSettings - Callback to open app settings
 */
export function PermissionDenied({ onOpenSettings }: PermissionDeniedProps) {
  return (
    <Container>
      <IconText>🚫</IconText>
      <Title>Camera Access Denied</Title>
      <Description>
        To use this app, please enable camera access in your device settings.
      </Description>
      <SettingsButton onPress={onOpenSettings}>
        <ButtonText>Go to Settings</ButtonText>
      </SettingsButton>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const IconText = styled.Text`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.heading.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.heading.fontWeight};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

const SettingsButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  padding-horizontal: ${({ theme }) => theme.spacing.xl}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 600;
`;
