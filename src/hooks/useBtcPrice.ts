import { useState, useEffect, useRef } from 'react'

interface BtcPriceData {
  price: number
  change24h: number
  loading: boolean
  error: string | null
}

const FALLBACK_PRICE = 69000

export function useBtcPrice(): BtcPriceData {
  const [data, setData] = useState<BtcPriceData>({
    price: FALLBACK_PRICE,
    change24h: 0,
    loading: true,
    error: null,
  })
  const prevPriceRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPrice() {
      try {
        // Primary: Coinbase (no rate limits, reliable)
        const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot')
        if (!res.ok) throw new Error('Coinbase API failed')
        const json = await res.json()
        const price = Math.round(parseFloat(json.data.amount))

        if (!cancelled) {
          // Calculate change from previous fetch (rough 24h proxy)
          const prev = prevPriceRef.current
          const change = prev ? ((price - prev) / prev) * 100 : 0
          if (!prev) prevPriceRef.current = price

          setData({
            price,
            change24h: change,
            loading: false,
            error: null,
          })
        }
      } catch {
        // Fallback: CoinGecko
        try {
          const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
          )
          if (!res.ok) throw new Error('CoinGecko API failed')
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
    }

    fetchPrice()

    // Also fetch 24h change from CoinGecko (Coinbase doesn't provide it)
    async function fetch24hChange() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
        )
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled && json.bitcoin?.usd_24h_change) {
          setData(prev => ({ ...prev, change24h: json.bitcoin.usd_24h_change }))
        }
      } catch {
        // Silent fail — 24h change is nice-to-have
      }
    }

    fetch24hChange()

    const interval = setInterval(fetchPrice, 30000) // Poll every 30s for fresher data

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return data
}
