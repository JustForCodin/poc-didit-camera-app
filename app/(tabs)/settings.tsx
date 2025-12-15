import styled from 'styled-components/native';
import Constants from 'expo-constants';
import { Heading, BodyText, Caption, Card, CardContent } from '@/src/components/styled';

const appVersion = Constants.expoConfig?.version ?? '1.0.0';

const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Section = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const SectionTitle = styled(BodyText)`
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export default function SettingsScreen() {
  return (
    <Container>
      <Section>
        <Heading>Settings</Heading>
        <Caption>Configure your testing environment</Caption>
      </Section>

      <Section>
        <SectionTitle>Backend Configuration</SectionTitle>
        <Card>
          <CardContent>
            <Caption>DiditCamera, Gemini, and Claude settings coming in Epic 3</Caption>
          </CardContent>
        </Card>
      </Section>

      <Section>
        <SectionTitle>Device Settings</SectionTitle>
        <Card>
          <CardContent>
            <Caption>Device name and frame interval settings available</Caption>
          </CardContent>
        </Card>
      </Section>

      <Section>
        <SectionTitle>About</SectionTitle>
        <Card>
          <CardContent>
            <BodyText>Vision AI Tester</BodyText>
            <Caption>Version {appVersion}</Caption>
          </CardContent>
        </Card>
      </Section>
    </Container>
  );
}
