import { unstable_setRequestLocale } from 'next-intl/server';
import { CheckoutSuccessPage } from '@/components/pages/checkout-success-page';

type Props = {
  params: { locale: string };
  searchParams: { session_id?: string };
};

export default async function CheckoutSuccess({ 
  params: { locale }, 
  searchParams 
}: Props) {
  unstable_setRequestLocale(locale);

  return <CheckoutSuccessPage sessionId={searchParams.session_id} />;
}
