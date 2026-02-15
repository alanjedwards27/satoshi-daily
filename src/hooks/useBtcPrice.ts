import { useState, useEffect } from 'react'

interface BtcPriceData {
  price: number
  change24h: number
  loading: boolean
  error: string | null
}

const FALLBACK_PRICE = 97500 // Reasonable fallback if API fails

export function useBtcPrice(): BtcPriceData {
  const [data, setData] = useState<BtcPriceData>({
    price: FALLBACK_PRICE,
    change24h: 0,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function fetchPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
        )
        if (!res.ok) throw new Error('API request failed')
        const json = await res.json()
        if (!cancelled) {
          setData({
            price: Math.round(json.bitcoin.usd),
            change24h: json.bitcoin.usd_24h_change,
            loading: false,
            error: null,
          })
        }
      } catch {
        if (!cancelled) {
          setData(prev => ({ ...prev, loading: false, error: 'Price fetch failed' }))
        }
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Poll every 60s

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return data
}
