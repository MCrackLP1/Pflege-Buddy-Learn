import { redirect } from 'next/navigation';

type Props = {
  searchParams: { session_id?: string };
};

export default function CheckoutSuccessRedirect({ searchParams }: Props) {
  // Redirect to the localized version with session_id
  const sessionId = searchParams.session_id;
  const redirectUrl = sessionId 
    ? `/de/checkout/success?session_id=${sessionId}`
    : '/de/checkout/success';
    
  redirect(redirectUrl);
}
