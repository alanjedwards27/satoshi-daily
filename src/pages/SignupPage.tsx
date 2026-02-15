import AppShell from '../components/layout/AppShell'
import SignupForm from '../components/signup/SignupForm'
import { usePageView } from '../hooks/usePageView'

export default function SignupPage() {
  usePageView('signup')

  return (
    <AppShell>
      <SignupForm />
    </AppShell>
  )
}
