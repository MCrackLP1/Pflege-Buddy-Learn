import { redirect } from 'next/navigation';

export default function CheckoutCancelRedirect() {
  // Redirect to the localized version
  redirect('/de/checkout/cancel');
}
