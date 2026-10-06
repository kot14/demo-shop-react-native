import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (password.length < 10) {
      setError('Пароль має містити щонайменше 10 символів');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password, fullName.trim());
      router.replace('/');
    } catch (e) {
      setError(errorMessage(e, 'Не вдалося зареєструватись'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Реєстрація" paddedBottomTab={false}>
      <View style={styles.form}>
        <ThemedText type="small">Імʼя</ThemedText>
        <TextInput
          value={fullName}
          onChangeText={(value) => {
            setFullName(value);
            setError(null);
          }}
          placeholder="Іван Петренко"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />

        <ThemedText type="small">Email</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError(null);
          }}
          placeholder="user@example.com"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />

        <ThemedText type="small">Пароль</ThemedText>
        <TextInput
          secureTextEntry
          autoComplete="new-password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError(null);
          }}
          placeholder="10–64 символи"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        />

        {error ? (
          <ThemedText type="small" style={styles.error}>
            {error}
          </ThemedText>
        ) : null}

        <UiButton label="Зареєструватись" loading={loading} onPress={onSubmit} />

        <UiButton
          label="Вже є акаунт? Увійти"
          variant="secondary"
          onPress={() => router.push('/login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 48,
  },
  error: {
    color: '#C62828',
  },
});
