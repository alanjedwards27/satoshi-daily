import AppShell from '../components/layout/AppShell'
import CodeInput from '../components/verify/CodeInput'
import { usePageView } from '../hooks/usePageView'

export default function VerifyPage() {
  usePageView('verify')

  return (
    <AppShell>
      <CodeInput />
    </AppShell>
  )
}
