import { unstable_setRequestLocale } from 'next-intl/server';
import { QuizPage } from '@/components/pages/quiz-page';

type Props = {
  params: { locale: string; topic: string };
};

export default function Quiz({ params: { locale, topic } }: Props) {
  unstable_setRequestLocale(locale);
  
  return <QuizPage topic={topic} />;
}
