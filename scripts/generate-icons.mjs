import sharp from 'sharp'

// Bitcoin orange
const BTC_ORANGE = '#f7931a'
const WHITE = '#ffffff'

// Bitcoin "B" path (based on official Bitcoin logo, centered in a viewBox 0 0 100 100)
// This is a simplified B with vertical bars
const btcPath = `
  M50 14 L50 22 M50 78 L50 86
  M42 14 L42 22 M42 78 L42 86
  M30 22 L58 22 C72 22 72 42 58 44 L30 44 L30 22 Z
  M30 44 L62 44 C78 44 78 66 62 68 L30 68 L30 44 Z
`

// Cleaner approach: use a well-known Bitcoin SVG path
function iconSvg(size) {
  const s = size
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    <circle cx="${s/2}" cy="${s/2}" r="${s/2}" fill="${BTC_ORANGE}"/>
    <g transform="translate(${s*0.22}, ${s*0.15}) scale(${s/180})">
      <path fill="${WHITE}" d="
        M63.04 39.74c4.27-2.85 6.91-7.58 6.23-14.07-1.42-11.42-10.65-14.95-22.56-15.93V0h-9.29v9.46c-2.44 0-4.94.05-7.42.1V0h-9.29v9.74c-2.01.04-3.99.07-5.91.07v-.03H2.84l.01 10.08s6.87-.13 6.74-.01c3.78 0 5.01 2.19 5.36 4.08v17.42H15.5c.26 0 .66.03 1.13.15h-.58v24.41c-.36 1.27-1.47 3.27-4.45 3.27.13.12-6.74 0-6.74 0L3.47 79.4h11.59c2.16 0 4.28.05 6.35.09v9.86h9.29V79.7c2.54.06 5 .08 7.42.08v9.57h9.29v-9.81c15.63-.9 26.58-4.84 27.94-19.56.72-11.86-4.47-17.14-13.37-19.28zm-22.17-20.5c6.22 0 25.77-1.97 25.77 11.14 0 12.5-19.55 11.08-25.77 11.08V19.24zm0 52.84V51.71c7.47 0 30.98-2.14 30.98 10.17 0 11.88-23.51 10.2-30.98 10.2z
      "/>
    </g>
  </svg>`)
}

// --- OG Share Image (1200x630) ---
function ogImageSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0d1117"/>
        <stop offset="100%" style="stop-color:#161b22"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#f7931a"/>
        <stop offset="100%" style="stop-color:#ffb347"/>
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>

    <!-- Subtle grid pattern -->
    <g opacity="0.03" stroke="${WHITE}" stroke-width="1">
      ${Array.from({length: 20}, (_, i) => `<line x1="${i * 65}" y1="0" x2="${i * 65}" y2="630"/>`).join('')}
      ${Array.from({length: 11}, (_, i) => `<line x1="0" y1="${i * 63}" x2="1200" y2="${i * 63}"/>`).join('')}
    </g>

    <!-- Large BTC circle -->
    <circle cx="230" cy="315" r="145" fill="${BTC_ORANGE}" opacity="0.1"/>
    <circle cx="230" cy="315" r="115" fill="${BTC_ORANGE}" opacity="0.2"/>
    <circle cx="230" cy="315" r="85" fill="${BTC_ORANGE}"/>

    <!-- Bitcoin B path inside circle -->
    <g transform="translate(192, 275) scale(0.85)">
      <path fill="${WHITE}" d="
        M63.04 39.74c4.27-2.85 6.91-7.58 6.23-14.07-1.42-11.42-10.65-14.95-22.56-15.93V0h-9.29v9.46c-2.44 0-4.94.05-7.42.1V0h-9.29v9.74c-2.01.04-3.99.07-5.91.07v-.03H2.84l.01 10.08s6.87-.13 6.74-.01c3.78 0 5.01 2.19 5.36 4.08v17.42H15.5c.26 0 .66.03 1.13.15h-.58v24.41c-.36 1.27-1.47 3.27-4.45 3.27.13.12-6.74 0-6.74 0L3.47 79.4h11.59c2.16 0 4.28.05 6.35.09v9.86h9.29V79.7c2.54.06 5 .08 7.42.08v9.57h9.29v-9.81c15.63-.9 26.58-4.84 27.94-19.56.72-11.86-4.47-17.14-13.37-19.28zm-22.17-20.5c6.22 0 25.77-1.97 25.77 11.14 0 12.5-19.55 11.08-25.77 11.08V19.24zm0 52.84V51.71c7.47 0 30.98-2.14 30.98 10.17 0 11.88-23.51 10.2-30.98 10.2z
      "/>
    </g>

    <!-- Title -->
    <text x="420" y="220" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="64" fill="${WHITE}" letter-spacing="-1">Satoshi Daily</text>

    <!-- Tagline -->
    <text x="420" y="275" font-family="Arial, Helvetica, sans-serif" font-weight="500" font-size="28" fill="#8b949e">The Daily Bitcoin Price Game</text>

    <!-- Divider line -->
    <rect x="420" y="305" width="120" height="3" rx="2" fill="${BTC_ORANGE}"/>

    <!-- Features -->
    <text x="448" y="365" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="26" fill="#c9d1d9">Predict the daily BTC price</text>
    <circle cx="432" cy="358" r="5" fill="${BTC_ORANGE}"/>

    <text x="448" y="410" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="26" fill="#c9d1d9">Win real Bitcoin via Lightning</text>
    <circle cx="432" cy="403" r="5" fill="${BTC_ORANGE}"/>

    <text x="448" y="455" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="26" fill="#c9d1d9">$5 daily prize pool — 100% free</text>
    <circle cx="432" cy="448" r="5" fill="${BTC_ORANGE}"/>

    <!-- URL button -->
    <rect x="420" y="495" width="320" height="52" rx="26" fill="${BTC_ORANGE}"/>
    <text x="580" y="528" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="22" fill="${WHITE}">satoshidaily.app</text>

    <!-- Top accent bar -->
    <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>
    <!-- Bottom accent bar -->
    <rect x="0" y="626" width="1200" height="4" fill="url(#accent)"/>
  </svg>`)
}

async function generate() {
  // Favicon 32x32
  await sharp(iconSvg(64)).resize(32, 32).png().toFile('public/favicon-32.png')
  console.log('✓ favicon-32.png')

  // PWA 192x192
  await sharp(iconSvg(384)).resize(192, 192).png().toFile('public/icon-192.png')
  console.log('✓ icon-192.png')

  // PWA 512x512
  await sharp(iconSvg(512)).png().toFile('public/icon-512.png')
  console.log('✓ icon-512.png')

  // Apple touch icon 180x180
  await sharp(iconSvg(360)).resize(180, 180).png().toFile('public/apple-touch-icon.png')
  console.log('✓ apple-touch-icon.png')

  // OG image 1200x630
  await sharp(ogImageSvg()).png().toFile('public/og-image.png')
  console.log('✓ og-image.png')

  console.log('\nAll icons generated!')
}

generate().catch(console.error)
