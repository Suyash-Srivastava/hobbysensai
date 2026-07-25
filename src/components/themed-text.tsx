import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code' | 'eyebrow';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  // "eyebrow" defaults to the brand amber label color rather than plain body text.
  const defaultColorKey = type === 'eyebrow' ? 'eyebrow' : 'text';

  return (
    <Text
      style={[
        { color: theme[themeColor ?? defaultColorKey] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'eyebrow' && styles.eyebrow,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.medium,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.semibold,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.medium,
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontFamily: Fonts.headline,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: Fonts.title,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Fonts.semibold,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.labelMedium,
    fontSize: 12,
  },
  eyebrow: {
    fontFamily: Fonts.label,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
