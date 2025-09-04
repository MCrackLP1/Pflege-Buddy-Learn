import { unstable_setRequestLocale } from 'next-intl/server';
import { StorePage } from '@/components/pages/store-page';

type Props = {
  params: { locale: string };
};

export default function Store({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  
  return <StorePage />;
}
