import styled from 'styled-components/native';

interface ButtonContainerProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const ButtonContainer = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
})<ButtonContainerProps>`
  background-color: ${({ theme, variant, disabled }) => {
    if (disabled) return theme.colors.border;
    return variant === 'secondary' ? theme.colors.secondary : theme.colors.primary;
  }};
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const ButtonText = styled.Text`
  color: #ffffff;
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
`;
