import type { Metadata } from 'next'
import { SignInPageTemplate } from '@/features/sign-in'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function Page() {
  return <SignInPageTemplate />
}
