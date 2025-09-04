import { unstable_setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/components/pages/home-page';

type Props = {
  params: { locale: string };
};

export default function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  
  return <HomePage />;
}
