import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { formatPrice } from '@/api/format';
import { myOrders } from '@/api/orders';
import type { OrderView } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

const STATUS_LABEL: Record<OrderView['status'], string> = {
  NEW: 'Нове',
  PAID: 'Оплачено',
  CANCELLED: 'Скасовано',
};

export default function OrdersScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await myOrders());
    } catch (e) {
      setError(errorMessage(e, 'Не вдалося завантажити замовлення'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) return;

      if (!isAuthenticated) {
        setOrders([]);
        setError(null);
        setLoading(false);
        return;
      }

      let cancelled = false;

      (async () => {
        setLoading(true);
        setError(null);
        try {
          const next = await myOrders();
          if (!cancelled) setOrders(next);
        } catch (e) {
          if (!cancelled) setError(errorMessage(e, 'Не вдалося завантажити замовлення'));
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [authLoading, isAuthenticated])
  );

  if (authLoading) {
    return <Screen title="Замовлення" loading />;
  }

  if (!isAuthenticated) {
    return (
      <Screen title="Замовлення">
        <ThemedText themeColor="textSecondary">Увійдіть, щоб бачити замовлення.</ThemedText>
        <UiButton label="Увійти" onPress={() => router.push('/login')} />
      </Screen>
    );
  }

  return (
    <Screen title="Замовлення" loading={loading}>
      {error ? <ThemedText themeColor="textSecondary">{error}</ThemedText> : null}

      {orders.map((order) => (
        <ThemedView key={order.id} type="backgroundElement" style={styles.card}>
          <View style={styles.header}>
            <ThemedText type="smallBold">№ {order.id}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {STATUS_LABEL[order.status]}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {new Date(order.createdAt).toLocaleString('uk-UA')}
          </ThemedText>
          <ThemedText type="smallBold">{formatPrice(order.totalMinor)}</ThemedText>
          {order.items.map((item) => (
            <ThemedText
              key={`${order.id}-${item.productId}`}
              type="small"
              themeColor="textSecondary">
              {item.productName} × {item.quantity}
            </ThemedText>
          ))}
        </ThemedView>
      ))}

      {!loading && !error && orders.length === 0 ? (
        <ThemedText themeColor="textSecondary">Замовлень ще немає</ThemedText>
      ) : null}

      {!loading ? <UiButton label="Оновити" variant="secondary" onPress={load} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
