import { ActivityIndicator, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = ViewProps & {
  title?: string;
  scroll?: boolean;
  loading?: boolean;
  paddedBottomTab?: boolean;
};

export function Screen({
  title,
  scroll = true,
  loading,
  paddedBottomTab = true,
  children,
  style,
  ...rest
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = (paddedBottomTab ? BottomTabInset : 0) + insets.bottom + Spacing.three;

  const content = (
    <View
      style={[
        styles.inner,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: bottomPad,
          paddingLeft: insets.left + Spacing.three,
          paddingRight: insets.right + Spacing.three,
        },
        style,
      ]}
      {...rest}>
      {title ? (
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      ) : (
        children
      )}
    </View>
  );

  if (!scroll) {
    return <View style={[styles.root, { backgroundColor: theme.background }]}>{content}</View>;
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    flexGrow: 1,
  },
  title: {
    marginBottom: Spacing.one,
  },
  loading: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
