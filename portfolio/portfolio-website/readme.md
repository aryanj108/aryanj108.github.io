# Aryan Jalota — Portfolio (3D Website)

This is the **3D scene** repository for Aryan Jalota's portfolio. It renders an
interactive 3D room whose computer monitor embeds the 2D "OS" portfolio
(the [`portfolio-inner-site`](../portfolio-inner-site) repo) inside an iframe.

> This site is adapted from the open-source portfolio created by
> **Henry Heffernan** ([henryheffernan.com](https://henryheffernan.com/) ·
> [original 3D repo](https://github.com/henryjeff/portfolio-website) ·
> [original 2D repo](https://github.com/henryjeff/portfolio-inner-site)).
> The original 3D scene, models, textures, and sound design are Henry's work
> and remain credited in the in-app Credits and in `LICENSE.md`. The content,
> copy, projects, and experience have been replaced with Aryan's.

Questions or comments? Email <a href="mailto:aryanjalota483@gmail.com"><samp>aryanjalota483@gmail.com</samp></a>,
or reach out on <a href="https://www.linkedin.com/in/aryanjalota/"><samp>LinkedIn</samp></a>.

<br>

## How the two repos fit together

- **portfolio-website** (this repo) — Three.js + webpack 3D scene.
- **portfolio-inner-site** — React "desktop OS" that loads inside the monitor.

The monitor iframe URL is configured in
`src/Application/World/MonitorScreen.ts` (`OS_PROD_URL` / `OS_DEV_URL`). By
default it loads the inner-site dev server at `http://localhost:3000/`, so run
that project first, then run this one.

<br>

To set up a dev environment:

```bash
# Install dependencies
npm i

# Run the local dev server
npm run dev
```

To serve a production build:

```bash
# Install dependencies if not already done - 'npm i'

# Build for production
npm run build

# Serve the build using express
npm start
```
