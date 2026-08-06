# Abstract SMP website

A static, responsive series archive for Abstract SMP. It has no build step or runtime dependencies, so GitHub Pages can serve it directly from the repository.

## Project structure

```text
.
├── index.html              # Page content and metadata
├── assets/
│   ├── css/styles.css      # Layout, visual system, and responsive styles
│   ├── js/app.js           # Navigation, filters, and reveal effects
│   └── images/             # Site mark and series thumbnails
├── .nojekyll               # Keeps GitHub Pages in static-file mode
└── README.md
```

## Preview locally

You can open `index.html` directly, or run any simple static server from this folder. For example, if Python is installed:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Push this folder to a GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.

All asset URLs are relative, so the site works for both account sites and project sites.

## Updating content

- Edit copy and episode cards in `index.html`.
- Add images below `assets/images/` and use lowercase file/folder names.
- Add real episode links by wrapping each `.episode-card` in an anchor or adding a watch link inside it.
