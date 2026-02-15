import AppShell from '../components/layout/AppShell'

export default function TermsPage() {
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

        <h1 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '8px' }}>Terms & Conditions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Last updated: February 2025</p>

        <p>These Terms & Conditions ("Terms") govern your use of Satoshi Daily ("we", "us", "our"), the website at <strong>satoshidaily.app</strong> (the "Site"), and the free daily Bitcoin price prediction game (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>

        <h2 style={h2Style}>1. Eligibility</h2>
        <ul style={ulStyle}>
          <li>You must be at least <strong>18 years of age</strong> to use the Service.</li>
          <li>You must provide a valid email address to create an account.</li>
          <li>One account per person. Creating multiple accounts to gain additional predictions is prohibited and will result in disqualification.</li>
          <li>The Service is available worldwide, subject to local laws. It is your responsibility to ensure participation is lawful in your jurisdiction.</li>
        </ul>

        <h2 style={h2Style}>2. The Game</h2>

        <h3 style={h3Style}>How it works</h3>
        <ul style={ulStyle}>
          <li>Each day, a <strong>target time</strong> is randomly determined (between 9:00 and 20:59 UTC).</li>
          <li>You predict what the price of Bitcoin (BTC/USD) will be at that target time.</li>
          <li>Predictions must be submitted before <strong>midnight GMT</strong> (00:00 UTC) on the game day.</li>
          <li>Each player gets <strong>one free prediction per day</strong>.</li>
          <li>A <strong>bonus second prediction</strong> can be earned by sharing the game on social media or via email/link. This bonus is optional and costs nothing.</li>
        </ul>

        <h3 style={h3Style}>No purchase necessary</h3>
        <p><strong>Satoshi Daily is completely free to play. No purchase is necessary to enter or win.</strong> There are no paid upgrades, premium tiers, or hidden fees. The bonus second guess is earned through sharing, not purchasing.</p>

        <h3 style={h3Style}>Price determination</h3>
        <ul style={ulStyle}>
          <li>The official BTC price at the target time is determined by taking the <strong>median price</strong> from three independent sources: Coinbase, CoinGecko, and Binance.</li>
          <li>This approach ensures fairness — no single API outage or manipulation can affect the result.</li>
          <li>The recorded price is final and not subject to appeal.</li>
        </ul>

        <h2 style={h2Style}>3. Prizes</h2>

        <h3 style={h3Style}>Prize pool</h3>
        <ul style={ulStyle}>
          <li>The daily prize pool is <strong>£5 (GBP)</strong>, paid in Bitcoin via the Lightning Network.</li>
          <li>The prize pool is funded by Satoshi Daily. No entry fees or contributions from players are required.</li>
        </ul>

        <h3 style={h3Style}>Winning criteria</h3>
        <ul style={ulStyle}>
          <li>To win, your prediction must be within <strong>$500</strong> of the actual BTC price at the target time.</li>
          <li>If you made two predictions (using the bonus guess), only your <strong>closest prediction</strong> counts.</li>
          <li>All qualifying players share the prize pool equally.</li>
        </ul>

        <h3 style={h3Style}>Prize tiers</h3>
        <ul style={ulStyle}>
          <li><strong>Exact Match</strong> (within $1) — qualifies for the prize pool.</li>
          <li><strong>Within $100</strong> — qualifies for the prize pool.</li>
          <li><strong>Within $500</strong> — qualifies for the prize pool.</li>
        </ul>
        <p>All qualifying tiers receive an equal share. For example, if 5 players qualify, each receives £1.00 worth of BTC.</p>

        <h3 style={h3Style}>Prize distribution</h3>
        <ul style={ulStyle}>
          <li>Prizes are paid in Bitcoin via the <strong>Lightning Network</strong>.</li>
          <li>Winners will be contacted via their registered email to arrange payment.</li>
          <li>Prizes must be claimed within <strong>30 days</strong> of the game date. Unclaimed prizes are forfeited.</li>
          <li>We reserve the right to verify your identity before processing payment.</li>
          <li>If no players qualify on a given day, no prizes are awarded for that day.</li>
        </ul>

        <h3 style={h3Style}>Tax responsibility</h3>
        <p>You are solely responsible for any tax obligations arising from prizes received. Satoshi Daily does not provide tax advice.</p>

        <h2 style={h2Style}>4. Fair Play</h2>
        <ul style={ulStyle}>
          <li><strong>One account per person.</strong> Duplicate accounts will be banned and any associated winnings voided.</li>
          <li><strong>No bots or automation.</strong> Predictions must be made manually by a human. Automated submissions will result in permanent ban.</li>
          <li><strong>No collusion.</strong> Coordinated group entries designed to manipulate outcomes are prohibited.</li>
          <li>We reserve the right to investigate suspicious activity and disqualify players at our sole discretion.</li>
          <li>Disqualified players forfeit any pending or unclaimed prizes.</li>
        </ul>

        <h2 style={h2Style}>5. Intellectual Property</h2>
        <p>All content on the Site — including the name "Satoshi Daily", logo, design, code, and text — is owned by us or licensed to us. You may not copy, modify, distribute, or create derivative works without our written permission.</p>
        <p>User-generated content (predictions, shared posts) remains yours, but you grant us a non-exclusive licence to display it on leaderboards and in marketing materials.</p>

        <h2 style={h2Style}>6. Disclaimer</h2>
        <ul style={ulStyle}>
          <li>Satoshi Daily is a <strong>game of skill and entertainment</strong>. It is not financial advice, investment guidance, or a gambling service.</li>
          <li>We make no guarantees about the accuracy of Bitcoin price data, though we use multiple independent sources to ensure fairness.</li>
          <li>The Service is provided "as is" without warranties of any kind, express or implied.</li>
          <li>We are not responsible for losses arising from your use of the Service, including but not limited to: missed predictions due to technical issues, incorrect price data from third-party APIs, or Lightning Network transaction failures.</li>
        </ul>

        <h2 style={h2Style}>7. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, Satoshi Daily's total liability to you for any claims arising from or related to the Service shall not exceed <strong>£5</strong> (the value of one day's prize pool).</p>
        <p>We are not liable for any indirect, incidental, special, consequential, or punitive damages.</p>

        <h2 style={h2Style}>8. Service Availability</h2>
        <ul style={ulStyle}>
          <li>We aim to operate the Service daily but do not guarantee uninterrupted availability.</li>
          <li>We may suspend or discontinue the Service at any time, with or without notice.</li>
          <li>We may modify the prize pool amount, winning threshold, or game mechanics at any time. Changes will be announced on the Site.</li>
          <li>If the Service is unavailable on a given day due to technical issues, no prizes are awarded for that day.</li>
        </ul>

        <h2 style={h2Style}>9. Account Termination</h2>
        <ul style={ulStyle}>
          <li>You may delete your account at any time by emailing <a href="mailto:support@satoshidaily.app" style={linkStyle}>support@satoshidaily.app</a>.</li>
          <li>We may suspend or terminate your account if you breach these Terms.</li>
          <li>Upon termination, you lose access to the Service and forfeit any unclaimed prizes.</li>
        </ul>

        <h2 style={h2Style}>10. Governing Law</h2>
        <p>These Terms are governed by and construed in accordance with the laws of <strong>England and Wales</strong>. Any disputes shall be subject to the exclusive jurisdiction of the English courts.</p>

        <h2 style={h2Style}>11. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. Changes will be posted on this page with an updated date. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>

        <h2 style={h2Style}>12. Contact</h2>
        <p>For questions about these Terms:</p>
        <p>
          Email: <a href="mailto:support@satoshidaily.app" style={linkStyle}>support@satoshidaily.app</a><br />
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
