import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Track a page view in Supabase. Fire-and-forget on mount.
 */
export function usePageView(page: string) {
  useEffect(() => {
    async function track() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        await supabase.from('page_views').insert({
          page,
          user_id: session?.user?.id ?? null,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        })
      } catch {
        // Silently fail — analytics should never break the app
      }
    }

    track()
  }, [page])
}
