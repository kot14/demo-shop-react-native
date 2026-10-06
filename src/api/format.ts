export const formatPrice = (minor: number, currency = 'UAH') =>
  new Intl.NumberFormat('uk-UA', { style: 'currency', currency }).format(minor / 100);
