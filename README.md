# Joshua Nwachinemere Portfolio — Redirect

The portfolio and its source repository have moved:

- **Live portfolio:** <https://joshua-nwachinemere.pages.dev/>
- **Source repository:** <https://github.com/dk3yyyy/joshua-nwachinemere>
- **Legacy share route:** `/share-v3/` is preserved so previously shared Telegram links keep working.

This repository exists only to preserve the previous GitHub Pages URL (`dk3yyyy.github.io/joshua-portfolio`). Both `index.html` and `share-v3/index.html` redirect to the live site and carry the current social card.

## Custom domain

`joshuanwachinemere.dev` is registered but not yet pointed at Cloudflare Pages. Once the domain serves the portfolio, change the three `https://joshua-nwachinemere.pages.dev/` URLs (canonical, `og:url`, refresh target) and the `location.replace` target in both HTML files to `https://joshuanwachinemere.dev/`, then update the links above.
