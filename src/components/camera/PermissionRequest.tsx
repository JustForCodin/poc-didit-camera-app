/**
 * Permission Request Component
 *
 * Displayed when camera permission has not been requested yet.
 * Provides clear explanation and request button.
 */

import React from 'react';
import styled from 'styled-components/native';

interface PermissionRequestProps {
  onRequestPermission: () => void;
}

/**
 * Permission request UI for undetermined camera permission state
 *
 * @param onRequestPermission - Callback to trigger permission request
 */
export function PermissionRequest({
  onRequestPermission,
}: PermissionRequestProps) {
  return (
    <Container>
      <IconText>📷</IconText>
      <Title>Camera Access Required</Title>
      <Description>
        Camera access is required to capture frames for AI analysis
      </Description>
      <RequestButton onPress={onRequestPermission}>
        <ButtonText>Enable Camera Access</ButtonText>
      </RequestButton>
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

const RequestButton = styled.TouchableOpacity`
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
