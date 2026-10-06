import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { addToCart } from '@/api/cart';
import { errorMessage } from '@/api/errors';
import { formatPrice } from '@/api/format';
import { getProduct } from '@/api/products';
import type { Product } from '@/api/types';
import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { UiButton } from '@/components/ui-button';
import { Spacing } from '@/constants/theme';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const invalidId = !Number.isFinite(productId);
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!invalidId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(invalidId ? 'Невірний товар' : null);

  useEffect(() => {
    if (invalidId) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getProduct(productId);
        if (!cancelled) setProduct(data);
      } catch (e) {
        if (!cancelled) setError(errorMessage(e, 'Не вдалося завантажити товар'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invalidId, productId]);

  async function onAdd() {
    if (!product) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      await addToCart(product.id, 1);
      Alert.alert('Додано', `${product.name} у кошику`);
    } catch (e) {
      Alert.alert('Помилка', errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title={product?.name ?? 'Товар'} loading={loading} paddedBottomTab={false}>
      {error ? <ThemedText themeColor="textSecondary">{error}</ThemedText> : null}

      {product ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            SKU: {product.sku}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.price}>
            {formatPrice(product.priceMinor)}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {product.description || 'Опис відсутній'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            У наявності: {product.stock}
          </ThemedText>
          <UiButton
            label={isAuthenticated ? 'Додати в кошик' : 'Увійти, щоб купити'}
            loading={busy}
            disabled={product.stock <= 0}
            onPress={onAdd}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  price: {
    marginVertical: Spacing.one,
  },
});
