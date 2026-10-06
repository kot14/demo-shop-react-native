import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { getCart, removeFromCart, setCartItemQuantity } from '@/api/cart';
import { errorMessage } from '@/api/errors';
import { formatPrice } from '@/api/format';
import { checkoutFromCart } from '@/api/orders';
import { getProduct } from '@/api/products';
import type { CartView, Product } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

type CartRow = {
  productId: number;
  quantity: number;
  product?: Product;
};

async function enrichCart(cart: CartView): Promise<CartRow[]> {
  return Promise.all(
    cart.items.map(async (item) => {
      try {
        const product = await getProduct(item.productId);
        return { ...item, product };
      } catch {
        return item;
      }
    })
  );
}

export default function CartScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [rows, setRows] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) return;

      if (!isAuthenticated) {
        setRows([]);
        setError(null);
        setLoading(false);
        return;
      }

      let cancelled = false;

      (async () => {
        setLoading(true);
        setError(null);
        try {
          const next = await enrichCart(await getCart());
          if (!cancelled) setRows(next);
        } catch (e) {
          if (!cancelled) setError(errorMessage(e, 'Не вдалося завантажити кошик'));
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
    return <Screen title="Кошик" loading />;
  }

  if (!isAuthenticated) {
    return (
      <Screen title="Кошик">
        <ThemedText themeColor="textSecondary">Увійдіть, щоб переглянути кошик.</ThemedText>
        <UiButton label="Увійти" onPress={() => router.push('/login')} />
        <UiButton
          label="Реєстрація"
          variant="secondary"
          onPress={() => router.push('/register')}
        />
      </Screen>
    );
  }

  async function changeQty(productId: number, quantity: number) {
    setBusy(true);
    try {
      const cart =
        quantity <= 0
          ? await removeFromCart(productId)
          : await setCartItemQuantity(productId, quantity);
      setRows(await enrichCart(cart));
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    setBusy(true);
    try {
      const result = await checkoutFromCart();
      Alert.alert('Замовлення створено', `№ ${result.orderId}`);
      setRows([]);
      router.push('/orders');
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const totalMinor = rows.reduce(
    (sum, row) => sum + (row.product?.priceMinor ?? 0) * row.quantity,
    0
  );

  return (
    <Screen title="Кошик" loading={loading}>
      {error ? <ThemedText themeColor="textSecondary">{error}</ThemedText> : null}

      {rows.map((row) => (
        <ThemedView key={row.productId} type="backgroundElement" style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText type="smallBold">
              {row.product?.name ?? `Товар #${row.productId}`}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {row.product ? formatPrice(row.product.priceMinor) : '—'} × {row.quantity}
            </ThemedText>
          </View>
          <View style={styles.actions}>
            <UiButton
              label="−"
              variant="secondary"
              disabled={busy}
              onPress={() => changeQty(row.productId, row.quantity - 1)}
              style={styles.qtyButton}
            />
            <UiButton
              label="+"
              variant="secondary"
              disabled={busy}
              onPress={() => changeQty(row.productId, row.quantity + 1)}
              style={styles.qtyButton}
            />
          </View>
        </ThemedView>
      ))}

      {!loading && rows.length === 0 && !error ? (
        <ThemedText themeColor="textSecondary">Кошик порожній</ThemedText>
      ) : null}

      {rows.length > 0 ? (
        <>
          <ThemedText type="smallBold">Разом: {formatPrice(totalMinor)}</ThemedText>
          <UiButton label="Оформити замовлення" loading={busy} onPress={checkout} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  qtyButton: {
    minHeight: 40,
    paddingHorizontal: Spacing.three,
  },
});
