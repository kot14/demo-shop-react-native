import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { errorMessage } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { API_BASE_URL } from '@/config';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function AccountScreen() {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  async function onSignOut() {
    setBusy(true);
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <Screen title="Акаунт" loading />;
  }

  return (
    <Screen title="Акаунт">
      <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
        API: {API_BASE_URL}
      </ThemedText>

      {isAuthenticated ? (
        <>
          <ThemedText>Ви увійшли в акаунт.</ThemedText>
          <UiButton label="Вийти" variant="danger" loading={busy} onPress={onSignOut} />
        </>
      ) : (
        <>
          <ThemedText themeColor="textSecondary">
            Увійдіть, щоб користуватись кошиком і замовленнями.
          </ThemedText>
          <UiButton label="Увійти" onPress={() => router.push('/login')} />
          <UiButton
            label="Реєстрація"
            variant="secondary"
            onPress={() => router.push('/register')}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: {
    marginBottom: Spacing.two,
  },
});
