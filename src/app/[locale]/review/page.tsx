import { unstable_setRequestLocale } from 'next-intl/server';
import { ReviewPage } from '@/components/pages/review-page';

type Props = {
  params: { locale: string };
};

export default function Review({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  
  return <ReviewPage />;
}