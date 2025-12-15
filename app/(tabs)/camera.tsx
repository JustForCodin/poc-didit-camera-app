import styled from 'styled-components/native';
import { useAppSelector, useAppDispatch, setDeviceName } from '@/src/store';
import {
  Card,
  CardContent,
  Heading,
  BodyText,
  Caption,
  ButtonContainer,
  ButtonText,
} from '@/src/components/styled';

const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Section = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export default function CameraScreen() {
  const deviceName = useAppSelector((state) => state.settings.deviceName);
  const frameInterval = useAppSelector((state) => state.settings.frameInterval);
  const dispatch = useAppDispatch();

  const handleSetDeviceName = () => {
    dispatch(setDeviceName('Test Device'));
  };

  return (
    <Container>
      <Section>
        <Heading>Vision AI Tester</Heading>
        <Caption>Camera functionality coming in Epic 2</Caption>
      </Section>

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
