import { unstable_setRequestLocale } from 'next-intl/server';
import { CheckoutCancelPage } from '@/components/pages/checkout-cancel-page';

type Props = {
  params: { locale: string };
};

export default async function CheckoutCancel({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return <CheckoutCancelPage />;
}
