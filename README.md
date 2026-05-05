# ryanmorrison.ca

Source for [ryanmorrison.ca](https://ryanmorrison.ca/) — a personal site
hosted on GitHub Pages.

## Local development

There's no dev server; just open the source HTML in a browser. The dev build
loads React + Babel from a CDN and compiles JSX in-browser.

```sh
open src/index.html
```

The Tweaks panel (preset switcher, shader knobs) only appears in this mode —
it's a development tool and isn't shipped to production.

## Deploying

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. Runs `npm install` then `npm run build`.
2. The build script (`build.mjs`) compiles `src/app.jsx` to `dist/app.js`,
   copies `styles.css` / `shader.js` / `CNAME` / `robots.txt` / `404.html`,
   and rewrites the script tags in `index.html` to load the compiled bundle
   instead of in-browser Babel.
3. Uploads `dist/` as a Pages artifact and deploys it.

To run the build locally:

```sh
npm install
npm run build
open dist/index.html
```

## Repo layout

```
src/
  index.html            site shell + meta tags
  styles.css            extracted styles
  app.jsx               React app (compiled to app.js by build.mjs)
  shader.js             WebGL shader (no build step)
  tweaks-panel.jsx      dev-only — not shipped
  CNAME                 custom-domain pin (ryanmorrison.ca)
  robots.txt
  404.html
build.mjs               build script
package.json            declares Babel devDeps
.github/workflows/
  deploy.yml            CI: build + Pages deploy
```

## Custom domain

`src/CNAME` contains `ryanmorrison.ca` and gets copied into `dist/` so Pages
preserves the custom-domain binding on every deploy.
