export interface LeaderboardEntry {
  rank: number
  email: string
  accuracy: number
  prediction: number
  isUser?: boolean
}

const MOCK_EMAILS = [
  'sa***@gmail.com',
  'bi***@proton.me',
  'cr***@yahoo.com',
  'ho***@outlook.com',
  'sa***@icloud.com',
  'bt***@gmail.com',
  'de***@hey.com',
  'lu***@gmail.com',
  'ma***@proton.me',
  'no***@gmail.com',
]

export function generateMockLeaderboard(actualPrice: number): LeaderboardEntry[] {
  return MOCK_EMAILS.map((email, i) => {
    // Generate predictions that get progressively less accurate
    const offsetPercent = (i + 1) * 0.3 + Math.random() * 0.5
    const direction = Math.random() > 0.5 ? 1 : -1
    const prediction = Math.round(actualPrice * (1 + (direction * offsetPercent) / 100))
    const accuracy = Math.max(0, 1 - Math.abs(prediction - actualPrice) / actualPrice)

    return {
      rank: i + 1,
      email,
      accuracy,
      prediction,
    }
  }).sort((a, b) => b.accuracy - a.accuracy).map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }))
}
