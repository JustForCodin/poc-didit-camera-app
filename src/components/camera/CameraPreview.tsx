/**
 * CameraPreview Component
 *
 * Displays a live camera preview using expo-camera.
 * Features:
 * - Uses rear camera by default
 * - Maintains proper aspect ratio (portrait orientation)
 * - Fills available space without distortion
 * - Memory-efficient lifecycle management
 * - Forwards camera ref for recording/capture (via forwardRef)
 */

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import styled from 'styled-components/native';

export interface CameraPreviewProps {
  /** Whether the camera should be active */
  isActive?: boolean;
  /** Camera facing direction */
  facing?: CameraType;
  /** Callback when camera is ready */
  onCameraReady?: () => void;
  /** Callback when camera encounters an error */
  onMountError?: (error: Error) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Ref type exposed by CameraPreview
 * Exposes the underlying CameraView for recording/capture operations
 */
export interface CameraPreviewRef {
  /** Get the underlying CameraView ref for recording operations */
  getCameraRef: () => React.RefObject<CameraView | null>;
}

/**
 * CameraPreview displays a live camera feed.
 * Supports forwarding the camera ref for recording operations.
 *
 * @example
 * ```tsx
 * const cameraPreviewRef = useRef<CameraPreviewRef>(null);
 *
 * // Get camera ref for recording
 * const cameraRef = cameraPreviewRef.current?.getCameraRef();
 *
 * <CameraPreview
 *   ref={cameraPreviewRef}
 *   isActive={true}
 *   facing="back"
 *   onCameraReady={() => console.log('Camera ready')}
 * />
 * ```
 */
export const CameraPreview = forwardRef<CameraPreviewRef, CameraPreviewProps>(
  function CameraPreview(
    {
      isActive = true,
      facing = 'back',
      onCameraReady,
      onMountError,
      testID = 'camera-preview',
    },
    ref
  ) {
  // Camera ref for recording and frame capture
  const cameraRef = useRef<CameraView>(null);

  // Expose camera ref to parent components
  useImperativeHandle(ref, () => ({
    getCameraRef: () => cameraRef,
  }), []);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Reset error state when becoming active
  useEffect(() => {
    if (isActive) {
      setHasError(false);
      setErrorMessage('');
    }
  }, [isActive]);

  const handleCameraReady = () => {
    setIsCameraReady(true);
    onCameraReady?.();
  };

  const handleMountError = (event: { message: string }) => {
    const error = new Error(event.message || 'Failed to initialize camera');
    setHasError(true);
    setErrorMessage(error.message);
    onMountError?.(error);
  };

  // Don't render camera when inactive to save resources
  if (!isActive) {
    return (
      <PreviewContainer testID={testID}>
        <InactiveOverlay>
          <InactiveText>Camera Paused</InactiveText>
        </InactiveOverlay>
      </PreviewContainer>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <PreviewContainer testID={testID}>
        <ErrorOverlay>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorText>Camera Error</ErrorText>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </ErrorOverlay>
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer testID={testID}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={handleCameraReady}
        onMountError={handleMountError}
      />
      {!isCameraReady && (
        <LoadingOverlay>
          <LoadingText>Initializing camera...</LoadingText>
        </LoadingOverlay>
      )}
    </PreviewContainer>
  );
});

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});

const PreviewContainer = styled.View`
  flex: 1;
  background-color: #000;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  overflow: hidden;
  min-height: 300px;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`;

const LoadingText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: #fff;
`;

const InactiveOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.text};
`;

const InactiveText = styled.Text`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const ErrorIcon = styled.Text`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ErrorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.heading.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.heading.fontWeight};
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const ErrorMessage = styled.Text`
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

export default CameraPreview;
