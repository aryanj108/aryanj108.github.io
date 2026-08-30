# aryanj108.github.io

Source for Aryan Jalota's portfolio, live at:

- **https://aryanj108.github.io/** — an interactive 3D office scene (Three.js).
  Its in-scene computer monitor renders a fully working desktop OS.
- **https://aryanj108.github.io/os/** — that same desktop OS, running on its
  own as a standalone site.

<br>

## Structure

This repo builds and publishes **two separate React apps** as one static
site:

| | |
|---|---|
| [`portfolio/portfolio-website`](portfolio/portfolio-website) | The 3D scene (Three.js + webpack 5). Served at `/`. |
| [`portfolio/portfolio-inner-site`](portfolio/portfolio-inner-site) | The desktop OS (Create React App). Served at `/` inside the 3D scene's monitor, and standalone at `/os/`. |

Each has its own README with setup details for that project specifically.

<br>

## Deployment

`.github/workflows/deploy.yml` builds both apps and publishes them together
to GitHub Pages on every push to `main` — no manual deploy step. It assembles
the 3D site's build output at the site root and the desktop OS's build output
under `/os/`, with an `index.html` copied to `404.html` so deep links (e.g.
`/os/projects`) survive a hard refresh on Pages, which has no server-side
routing.

<br>

## Local development

```bash
# 3D scene
cd portfolio/portfolio-website
npm install
npm run dev          # http://localhost:8080 (or similar)

# Desktop OS
cd portfolio/portfolio-inner-site
npm install
npm start             # http://localhost:3000
```

The 3D scene's in-scene monitor points at the desktop OS's dev server by
default (`OS_DEV_URL` in `src/Application/World/MonitorScreen.ts`), so run the
desktop OS first if you want the monitor to show it while developing the 3D
scene.

<br>

## Contact

<a href="mailto:aryanjalota483@gmail.com">aryanjalota483@gmail.com</a> ·
<a href="https://www.linkedin.com/in/aryanjalota/">LinkedIn</a> ·
<a href="https://github.com/aryanj108">GitHub</a>
