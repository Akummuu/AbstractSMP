# Abstract SMP website

A static, responsive story companion for Abstract SMP. It has no build step or runtime dependencies, so GitHub Pages can serve it directly from the repository.

## Project structure

```text
.
├── index.html              # Kurous Island landing page, characters, and contact
├── story.html              # Ongoing lore records and unanswered questions
├── episodes.html           # Filterable video/episode archive
├── world.html              # Locations and world registry
├── assets/
│   ├── css/styles.css      # Layout, visual system, and responsive styles
│   ├── js/app.js           # Navigation, filters, and reveal effects
│   └── images/             # Backgrounds, creator portraits, and thumbnails
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

- Add new lore records to the `.story-ledger` in `story.html`.
- Edit episode cards and their links in `episodes.html`.
- Add locations or civilizations to `world.html`.
- Keep the homepage focused on the current series introduction, characters, and contact details.
- Add images below `assets/images/` and use lowercase file/folder names.
- The creator portraits are local copies of the public images from the supplied YouTube channels.
