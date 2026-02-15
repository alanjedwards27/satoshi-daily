import AppShell from '../components/layout/AppShell'

export default function PrivacyPage() {
  return (
    <AppShell>
      <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0 0 16px',
            fontFamily: 'var(--font-body)',
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Last updated: February 2025</p>

        <p>Satoshi Daily ("we", "us", "our") operates the website <strong>satoshidaily.app</strong> (the "Site") and the free daily Bitcoin price prediction game (the "Service"). This Privacy Policy explains how we collect, use, and protect your information.</p>

        <h2 style={h2Style}>1. Information We Collect</h2>

        <h3 style={h3Style}>Information you provide</h3>
        <ul style={ulStyle}>
          <li><strong>Email address</strong> — required to create an account and verify your identity. Used to send you a magic link for authentication.</li>
          <li><strong>Marketing consent</strong> — whether you opted in to receive daily results, Bitcoin insights, and sponsor offers. Recorded with a timestamp.</li>
          <li><strong>Predictions</strong> — the Bitcoin price predictions you submit each day.</li>
        </ul>

        <h3 style={h3Style}>Information collected automatically</h3>
        <ul style={ulStyle}>
          <li><strong>Page views</strong> — which pages you visit (signup, verify, game). We record the page name, your user ID (if logged in), referrer URL, and user agent.</li>
          <li><strong>Device information</strong> — browser type, operating system, and screen size via your user agent string.</li>
          <li><strong>IP address</strong> — collected by our hosting provider (Netlify) and authentication provider (Supabase) as part of standard web traffic.</li>
        </ul>

        <h3 style={h3Style}>Information we do NOT collect</h3>
        <ul style={ulStyle}>
          <li>We do not collect payment card details, national insurance numbers, or government ID.</li>
          <li>We do not use tracking cookies for advertising purposes. We do not use Facebook Pixel or Google Analytics.</li>
          <li>We do not sell or rent your personal data to third parties.</li>
        </ul>

        <h2 style={h2Style}>2. How We Use Your Information</h2>
        <ul style={ulStyle}>
          <li><strong>Account authentication</strong> — to send magic link emails and verify your identity.</li>
          <li><strong>Game operation</strong> — to record predictions, determine winners, display leaderboards, and calculate streaks.</li>
          <li><strong>Prize fulfilment</strong> — to identify winners and facilitate Bitcoin Lightning payouts.</li>
          <li><strong>Marketing (opt-in only)</strong> — if you consented, to send daily results and Bitcoin insights. You can unsubscribe at any time.</li>
          <li><strong>Site improvement</strong> — to understand page visit patterns and improve the user experience.</li>
        </ul>

        <h2 style={h2Style}>3. Data Storage & Security</h2>
        <p>Your data is stored securely using <strong>Supabase</strong> (hosted on AWS in the EU). We use Row-Level Security (RLS) policies to ensure users can only access their own data. Authentication is handled by Supabase Auth with magic link verification — we never store passwords.</p>
        <p>Our site is served over HTTPS. All data in transit is encrypted via TLS.</p>

        <h2 style={h2Style}>4. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul style={ulStyle}>
          <li><strong>Supabase</strong> — database, authentication, and serverless functions.</li>
          <li><strong>Netlify</strong> — website hosting and CDN.</li>
          <li><strong>Resend</strong> — transactional email delivery (magic links, notifications).</li>
          <li><strong>Coinzilla</strong> — cryptocurrency-related advertising displayed on the Site. Coinzilla may use cookies to serve relevant ads. See <a href="https://coinzilla.com/privacy-policy/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Coinzilla's Privacy Policy</a>.</li>
          <li><strong>Coinbase, CoinGecko, Binance</strong> — public APIs used to fetch Bitcoin price data. No personal data is shared with these services.</li>
        </ul>

        <h2 style={h2Style}>5. Cookies</h2>
        <p>We use essential cookies only:</p>
        <ul style={ulStyle}>
          <li><strong>Authentication session</strong> — to keep you logged in between visits.</li>
          <li><strong>Local storage</strong> — to cache game state for faster loading. This is stored on your device only.</li>
        </ul>
        <p>Third-party ad providers (Coinzilla) may set their own cookies. You can control cookies through your browser settings.</p>

        <h2 style={h2Style}>6. Your Rights</h2>
        <p>Under UK GDPR and the Data Protection Act 2018, you have the right to:</p>
        <ul style={ulStyle}>
          <li><strong>Access</strong> — request a copy of your personal data.</li>
          <li><strong>Rectification</strong> — correct inaccurate personal data.</li>
          <li><strong>Erasure</strong> — request deletion of your account and all associated data.</li>
          <li><strong>Withdraw consent</strong> — unsubscribe from marketing emails at any time.</li>
          <li><strong>Data portability</strong> — receive your data in a portable format.</li>
          <li><strong>Complaint</strong> — lodge a complaint with the ICO (<a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={linkStyle}>ico.org.uk</a>).</li>
        </ul>
        <p>To exercise any of these rights, email us at <a href="mailto:privacy@satoshidaily.app" style={linkStyle}>privacy@satoshidaily.app</a>.</p>

        <h2 style={h2Style}>7. Data Retention</h2>
        <ul style={ulStyle}>
          <li><strong>Account data</strong> — retained while your account is active. Deleted within 30 days of an erasure request.</li>
          <li><strong>Predictions & game history</strong> — retained indefinitely for leaderboard and historical records. Anonymised upon account deletion.</li>
          <li><strong>Page views</strong> — retained for 12 months, then deleted.</li>
        </ul>

        <h2 style={h2Style}>8. Children</h2>
        <p>Satoshi Daily is not intended for anyone under the age of 18. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>

        <h2 style={h2Style}>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>

        <h2 style={h2Style}>10. Contact</h2>
        <p>For privacy-related enquiries:</p>
        <p>
          Email: <a href="mailto:privacy@satoshidaily.app" style={linkStyle}>privacy@satoshidaily.app</a><br />
          Website: satoshidaily.app
        </p>

        <div style={{ height: '48px' }} />
      </div>
    </AppShell>
  )
}

const h2Style: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginTop: '28px',
  marginBottom: '12px',
}

const h3Style: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginTop: '16px',
  marginBottom: '8px',
}

const ulStyle: React.CSSProperties = {
  paddingLeft: '20px',
  margin: '8px 0 16px',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--accent)',
  textDecoration: 'underline',
}
