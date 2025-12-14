import styled from 'styled-components/native';

interface CardProps {
  elevated?: boolean;
}

export const Card = styled.View<CardProps>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  ${({ elevated, theme }) =>
    elevated
      ? `
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
    elevation: 3;
    border-width: 0;
  `
      : `
    border-width: 1px;
    border-color: ${theme.colors.border};
  `}
`;

export const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const CardContent = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;
