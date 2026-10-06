# Tech Ease by Greg website

Plain HTML/CSS/JS (dark theme, Three.js 3D hero in scene.js, library vendored in vendor/). No build step. Hosted on Netlify, which serves the folder as-is.

## Add portfolio work
1. Put images in `assets/work/` (JPG/PNG/WebP, about 1200px wide).
2. Edit `work.js` and set `image: "assets/work/your-file.jpg"` (and `link` for live sites you're allowed to show).
   Categories: graphics, websites, webapps, mobile, seo.

## Enquiry emails (Netlify Forms)
The form named `enquiry` is detected by Netlify on deploy. To get emails:
Netlify → your site → **Forms** → enable form detection (if asked) → **Form notifications** → **Add notification** → **Email notification** → form `enquiry` → your email.
Free plan: 100 submissions per month. Spam is filtered with a hidden honeypot field.

## Custom domain (Dynadot)
Netlify → **Domain management** → **Add a domain**. At Dynadot → My Domains → Manage Domains → DNS Settings → Dynadot DNS:
- A record (root) → `75.2.60.5`
- CNAME `www` → `<your-site>.netlify.app`
