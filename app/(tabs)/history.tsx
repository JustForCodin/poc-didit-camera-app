import styled from 'styled-components/native';
import { Heading, BodyText, Caption } from '@/src/components/styled';

const Container = styled.View`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const EmptyStateText = styled(BodyText)`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PlaceholderCaption = styled(Caption)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

export default function HistoryScreen() {
  return (
    <Container>
      <Heading>Session History</Heading>
      <Caption>Your past testing sessions</Caption>

      <EmptyStateContainer>
        <EmptyStateText>
          No sessions yet.{'\n'}
          Start a recording in the Camera tab to create your first session.
        </EmptyStateText>
        <PlaceholderCaption>Session list coming in Epic 4</PlaceholderCaption>
      </EmptyStateContainer>
    </Container>
  );
}
