import styled from 'styled-components/native';

interface TextProps {
  color?: string;
}

export const Heading = styled.Text<TextProps>`
  font-size: ${({ theme }) => theme.typography.heading.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.heading.fontWeight};
  color: ${({ theme, color }) => color || theme.colors.text};
`;

export const BodyText = styled.Text<TextProps>`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  color: ${({ theme, color }) => color || theme.colors.text};
`;

export const Caption = styled.Text<TextProps>`
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  color: ${({ theme, color }) => color || theme.colors.textSecondary};
`;
