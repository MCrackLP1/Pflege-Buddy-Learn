import { unstable_setRequestLocale } from 'next-intl/server';
import { ProfilePage } from '@/components/pages/profile-page';

type Props = {
  params: { locale: string };
};

export default function Profile({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  
  return <ProfilePage />;
}
