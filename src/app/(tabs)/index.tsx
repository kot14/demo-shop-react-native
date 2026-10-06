import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { formatPrice } from '@/api/format';
import { listProducts } from '@/api/products';
import type { Product } from '@/api/types';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function CatalogScreen() {
  const theme = useTheme();
  const fetchedRef = useRef(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(force = false) {
    if (force) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await listProducts({ force });
      setProducts(data.filter((p) => p.active));
    } catch (e) {
      setError(errorMessage(e, 'Не вдалося завантажити каталог'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void load(false);
  }, []);

  return (
    <Screen title="Каталог" loading={loading} style={styles.screen}>
      {error ? <ThemedText themeColor="textSecondary">{error}</ThemedText> : null}

      {products.map((product) => (
        <Link
          key={product.id}
          href={{ pathname: '/product/[id]', params: { id: String(product.id) } }}
          asChild>
          <Pressable
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.75 : 1 },
            ]}>
            <View style={styles.rowText}>
              <ThemedText type="smallBold">{product.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {product.sku} · залишок {product.stock}
              </ThemedText>
            </View>
            <ThemedText type="smallBold">{formatPrice(product.priceMinor)}</ThemedText>
          </Pressable>
        </Link>
      ))}

      {!loading && !error && products.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.empty}>
          <ThemedText themeColor="textSecondary">Товарів поки немає</ThemedText>
        </ThemedView>
      ) : null}

      {!loading ? (
        <Pressable onPress={() => void load(true)} disabled={refreshing}>
          <ThemedText type="linkPrimary">
            {refreshing ? 'Оновлення…' : 'Оновити каталог'}
          </ThemedText>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  empty: {
    padding: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
