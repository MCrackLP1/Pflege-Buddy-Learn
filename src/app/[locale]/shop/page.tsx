import { unstable_setRequestLocale } from 'next-intl/server';
import { ShopPage } from '@/components/pages/shop-page';

type Props = {
  params: { locale: string };
};

export default async function Shop({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return <ShopPage />;
}
