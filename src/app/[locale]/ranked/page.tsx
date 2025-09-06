import { unstable_setRequestLocale } from 'next-intl/server';
import { RankedPage } from '@/components/pages/ranked-page';

type Props = {
  params: { locale: string };
};

export default function Ranked({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return <RankedPage />;
}
