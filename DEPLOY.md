# Running and deploying this site

The site is plain HTML, CSS and JavaScript. There is no build step, no Node, no package manager.
All content is in `data/*.json`; `assets/js/main.js` reads those files and draws the page.

```
index.html              page shell (no content in here)
assets/css/style.css    Monokai Classic theme and layout
assets/js/main.js       loads data/*.json and renders every section
assets/js/solver.js     the 2-opt route animation in the hero
assets/js/keyboard.js   the 3D keycap skills section
assets/js/window.js     the macOS-style desktop: draggable/resizable window, right-side dock, traffic lights
assets/resume.pdf       your résumé (replace the file to update it)
assets/img/             favicon and touch icon
data/                   ← edit these
.nojekyll               tells GitHub Pages to serve files as-is
.github/workflows/      deploy.yml (main → gh-pages) and preview.yml (PR previews)
```

## Editing content

| File | What it controls |
|---|---|
| `data/site.json` | Page title, description, the tab bar (order, file names, headings, comments), résumé path, footer |
| `data/overview.json` | Greeting, typing roles, bio, the "Next" PhD callout, hero animation caption and city count |
| `data/contact.json` | Your name and every contact link (hero buttons + `contact.sh` section) |
| `data/news.json` | Recent news list, newest first |
| `data/education.json` | Degrees, advisor, awards |
| `data/publications.json` | Papers. `me` lists the spellings of your name to highlight. `type` is `journal`, `conference`, `preprint` or `workshop` |
| `data/projects.json` | Industry projects timeline |
| `data/skills.json` | Keyboard keys. One skill = one key, in file order. `icon` (emoji), `color` (key accent), `group` (top-row filter key), `proficiency` 1–5 |

The résumé (`site.json → resume.path`) opens in its own viewer window on the desktop; phones without a built-in PDF viewer open it in a new tab.

To hide a whole section, remove its entry from `sections` in `data/site.json`.
To reorder sections, reorder that list.

Leave `doi`, `url` or `abstract` as `null` when you don't have them; the buttons hide automatically.
BibTeX is generated from the fields, so you never write it by hand.

**JSON is strict.** No trailing commas, double quotes only. The deploy workflow validates every file
and fails with the file name if one is broken. Locally you can check with `python3 -m json.tool data/news.json`.

## Previewing locally

Browsers block `fetch()` from `file://`, so double-clicking `index.html` shows an error. Start any static server in the repo folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(`npx serve .` or the VS Code "Live Server" extension work too.)

## Deploying on GitHub Pages

The previous site already deployed to the `gh-pages` branch through GitHub Actions, and the new workflows keep doing that,
just without the Next.js build. Check these settings once:

1. **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**, Branch: **`gh-pages`**, folder **`/ (root)`**.
2. **Settings → Actions → General → Workflow permissions: "Read and write permissions"** (the workflow pushes to `gh-pages`).
3. Push to `main`. The **Deploy to GitHub Pages** action validates the JSON, copies the site into `gh-pages` and Pages publishes it within a minute or two.

PR previews still work: open a pull request and `preview.yml` publishes it to
`https://trinhminh11.github.io/pr-preview/<branch-name>/`. All asset paths are relative, so the site works inside that subfolder.

### Simpler alternative (no Actions at all)

Because there is no build, you can also serve straight from `main`:
**Settings → Pages → Source: "Deploy from a branch" → `main` / `/ (root)`**.
If you do this, delete `.github/workflows/deploy.yml` and `preview.yml` (previews need the `gh-pages` branch).

### Custom domain (optional)

Add a file named `CNAME` at the repo root containing just your domain (e.g. `minh.dev`), and set the DNS records GitHub shows under Settings → Pages.
The deploy workflow copies `CNAME` along with everything else.

## Things to double-check

These were filled in from public indexes because Google Scholar itself could not be read from the build environment:

- `data/publications.json`: add a DOI or link for **MERIT** (DEFI 2025) once the proceedings are online.
- `data/publications.json` and `data/contact.json`: `scholarUrl` currently points to a Google Scholar *search*. Replace it with your profile URL (`https://scholar.google.com/citations?user=XXXX`).
- `data/education.json`: the HUST entry's degree title and years.
