# Repository guidance

## Project

This is Trinh The Minh's personal portfolio on GitHub Pages. It uses plain HTML,
CSS, JavaScript, and JSON, with no build step or package manager. Keep that
architecture unless the user explicitly requests a change. See `DEPLOY.md` for
local preview and deployment details.

## File map

- `index.html`: page shell, metadata, accessibility landmarks, and script loading.
- `data/site.json`: site metadata, section order and labels, résumé path, footer.
- `data/overview.json`: greeting, roles, biography, highlight, and pet copy.
- `data/contact.json`: name and contact links, including the hero buttons.
- Other `data/*.json`: news, education, publications, projects, and skills.
- `assets/css/style.css`: Monokai palette, layout, responsive rules, and states.
- `assets/js/main.js`: JSON loading, content rendering, section navigation,
  publication filtering, and generated BibTeX.
- `assets/js/cat.js` and `assets/js/roam.js`: Mochi and roaming interactions.
- `assets/js/keyboard.js`: interactive skills keyboard.
- `assets/js/window.js`: desktop, dock, window controls, and résumé viewer.
- `assets/resume.pdf`: résumé asset referenced by the site configuration.
- `.github/workflows/`: production deployment and pull request previews.

The editor-style filenames shown in navigation, such as `education.yml` and
`contact.sh`, are display labels. The actual content lives in JSON files.

## Making changes

- Edit `data/*.json` for content changes; edit the renderer only when behavior or
  markup needs to change. Preserve existing schemas and stable section/link IDs.
- Do not invent biographical details, publication metadata, dates, or URLs. Keep
  unknown optional fields `null` where the renderer supports it.
- Match the surrounding style: two-space indentation, strict JSON, vanilla
  JavaScript, and existing CSS conventions. Avoid unrelated reformatting.
- Use the CSS palette variables in `:root`. Preserve the Monokai dark theme,
  editor-inspired interface, and readable contrast. Hero contact buttons use
  yellow for Scholar, purple for GitHub, cyan for LinkedIn, orange for email,
  and green for the résumé.
- Preserve keyboard access, visible focus, accessible names, semantic links and
  buttons, and reduced-motion behavior. Check hover and focus when styling controls.
- Layout responds to the portfolio window's size through container queries.
  Consider resized windows as well as narrow browser viewports.
- Keep asset and data URLs relative so the site works under PR preview subpaths.
- Escape content inserted into HTML using the existing `esc()` helper. Preserve
  `noopener`/`noreferrer` protections on links that open external pages.
- Keep existing pet, keyboard, and desktop interactions working when changing
  shared markup or styles. Preserve script order and global module contracts.
- Respect existing user changes; keep each task scoped to the requested work.

## Local preview and validation

Serve the repository over HTTP; `file://` cannot load the JSON with `fetch()`:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. There is no build command or automated test suite
configured. Use checks appropriate to the files changed:

```sh
# Validate all content files.
python3 -c 'import json, pathlib; [json.loads(p.read_text()) for p in pathlib.Path("data").glob("*.json")]'

# Syntax-check each changed JavaScript file if Node.js is available.
node --check assets/js/main.js

# Check whitespace errors.
git diff --check
```

For visual or interaction changes, inspect the affected page in a browser at
desktop and mobile sizes, and check relevant keyboard, hover, and focus behavior.
For renderer changes, verify JSON loading and affected sections without console
errors. Report checks actually performed and any remaining verification limits.
Do not add dependencies or a test framework for a small styling or content edit.

## Deployment

- `.nojekyll` keeps GitHub Pages serving the static files as-is.
- `deploy.yml` validates JSON and publishes pushes to `main` to `gh-pages`.
- `preview.yml` publishes PRs under `pr-preview/<sanitized-branch-name>/` and
  removes their preview when the PR closes.
- Keep production deployment compatible with existing previews (`keep_files`).
- Do not modify generated `gh-pages` output as the source of a site change.
- The assembly steps copy repository files except their explicit exclusions;
  documentation added at the root may be published too. Never put secrets in
  repository files or browser-delivered data.
- Update `DEPLOY.md` when changing architecture, preview commands, or deployment
  behavior. Do not push or deploy solely because a local edit is complete.
