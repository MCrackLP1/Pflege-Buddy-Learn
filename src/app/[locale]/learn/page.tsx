import { unstable_setRequestLocale } from 'next-intl/server';
import { LearnPage } from '@/components/pages/learn-page';

type Props = {
  params: { locale: string };
};

export default function Learn({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  
  return <LearnPage />;
}
