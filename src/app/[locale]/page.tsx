import { unstable_setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/components/pages/home-page';
import { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isGerman = locale === 'de';

  return {
    title: isGerman
      ? 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte'
      : 'PflegeBuddy Learn - Interactive Learning Quiz for Nursing Professionals',
    description: isGerman
      ? 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen. Multiple-Choice Fragen zu Pflegeweiterbildung & Weiterbildung. Medizinisch fundiert & DSGVO-konform.'
      : 'Interactive learning quiz for nursing professionals. Collect XP points, test your medical knowledge. Multiple-choice questions for nursing continuing education. Medically sound & GDPR compliant.',
    keywords: isGerman
      ? 'Pflege, Lernquiz, Weiterbildung, Multiple-Choice, Fachwissen, Pflegekräfte, Medizin, Pflegeweiterbildung, Pflegefachwissen, medizinische Weiterbildung, Pflegequiz, Krankenpflege, Gesundheitswesen, Pflegeausbildung Deutschland, Pflegefortbildung, Pflege lernen online, Pflegequiz Deutschland, Pflegekräfte Weiterbildung'
      : 'Nursing, Learning Quiz, Continuing Education, Multiple-Choice, Expertise, Nursing Staff, Medicine, Nursing Education, Nursing Expertise, Medical Education, Nursing Quiz, Hospital Care, Healthcare, Nursing Education Germany, Nursing Training Online',
    alternates: {
      canonical: `https://www.pflegebuddy.app/${locale}`,
      languages: {
        'de': 'https://www.pflegebuddy.app/de',
        'en': 'https://www.pflegebuddy.app/en',
      },
    },
    openGraph: {
      title: isGerman
        ? 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte'
        : 'PflegeBuddy Learn - Interactive Learning Quiz for Nursing Professionals',
      description: isGerman
        ? 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen.'
        : 'Interactive learning quiz for nursing professionals. Collect XP points, test your medical knowledge.',
      url: `https://www.pflegebuddy.app/${locale}`,
      siteName: 'PflegeBuddy Learn',
      locale: isGerman ? 'de_DE' : 'en_US',
      type: 'website',
      images: [
        {
          url: 'https://www.pflegebuddy.app/og-image.jpg',
          width: 1200,
          height: 630,
          alt: isGerman
            ? 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte'
            : 'PflegeBuddy Learn - Interactive Learning Quiz for Nursing Professionals',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isGerman
        ? 'PflegeBuddy Learn - Interaktives Lernquiz für Pflegekräfte'
        : 'PflegeBuddy Learn - Interactive Learning Quiz for Nursing Professionals',
      description: isGerman
        ? 'Interaktives Lernquiz für Pflegefachkräfte. Sammle XP-Punkte, teste dein medizinisches Fachwissen.'
        : 'Interactive learning quiz for nursing professionals. Collect XP points, test your medical knowledge.',
      images: ['https://www.pflegebuddy.app/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return <HomePage />;
}
