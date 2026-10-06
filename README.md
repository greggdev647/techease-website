# Tech Ease by Greg website

Plain HTML/CSS/JS, no build step. Dark premium design: 3D TE logo hero (Three.js, scene.js), smooth scrolling (Lenis) and scroll animations (GSAP + ScrollTrigger + SplitText). All libraries are bundled in vendor/. Hosted on Netlify, which serves the folder as-is.

## Add portfolio work
1. Put images in `assets/work/` (JPG/PNG/WebP, about 1200px wide).
2. Edit `work.js`: set `image: "assets/work/your-file.jpg"`, a `title`, a `tag` (e.g. the year) and optionally a `link`.
   Categories: graphics, websites, webapps, mobile, seo. Projects without an image show a designed placeholder marked "Concept".

## Enquiry emails (Netlify Forms)
The form named `enquiry` is detected by Netlify on deploy. To get emails:
Netlify → your site → **Forms** → enable form detection (if asked) → **Form notifications** → **Add notification** → **Email notification** → form `enquiry` → your email.
Free plan: 100 submissions per month. Spam is filtered with a hidden honeypot field.

## Custom domain (Dynadot)
Netlify → **Domain management** → **Add a domain**. At Dynadot → My Domains → Manage Domains → DNS Settings → Dynadot DNS:
- A record (root) → `75.2.60.5`
- CNAME `www` → `<your-site>.netlify.app`
