import Script from 'next/script'

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || ''

export function Analytics() {
  if (!domain) {
    return null
  }

  return (
    <Script
      defer
      data-domain={domain}
      src={
        process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ||
        'https://plausible.io/js/script.js'
      }
      strategy="afterInteractive"
    />
  )
}
