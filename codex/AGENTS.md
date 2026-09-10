# Repository Guidelines

## Project Structure & Module Organization

This repository is a small static HTML tool collection. Pages live at the repository root:

- `tools.html` is the tool index and navigation hub.
- `index.html` implements the Apple app icon generator.
- `color.html` implements the RGB/color utility.
- `assets/css/` contains shared and page-specific styles.
- `assets/js/` contains page-specific browser scripts.

Keep navigation labels and links consistent. Keep generated/downloadable files out of version control.

## Build, Test, and Development Commands

There is no package manager or build step. Open pages directly for quick checks:

```sh
open tools.html
open index.html
open color.html
```

For a local HTTP server, use Node.js from the repo root:

```sh
npx http-server . -p 8000
```

Then visit `http://localhost:8000/tools.html`. Use this when `file://` behavior differs.

## Coding Style & Naming Conventions

Use two-space indentation for HTML, CSS, and JavaScript. Keep markup semantic, with clear class names such as `.topbar`, `.tool-card`, and `.button-row`. Prefer CSS custom properties in `:root`.

Maintain the existing visual style: light interfaces, 8px or smaller radii, Apple system font stacks, responsive grids, and `letter-spacing: 0`. Put common shell styles in `assets/css/shared.css`; keep page-only rules in the matching CSS file.

## User-Facing Copy

Page text is Chinese; keep new visible copy Chinese unless intentionally changed. Do not place prompt text, design instructions, implementation notes, roadmap notes, or generation rationale on the page. Avoid copy like “这里不翻页”, sampling-rule explanations, “后续可以...”, or ad/placeholder notes. Only show product names, controls, status, data values, and concise user-facing descriptions.

## Testing Guidelines

No general automated test suite is configured. Before committing, manually verify each changed page in a modern browser. Check desktop/mobile widths, navigation, file inputs, canvas/output behavior, color values, and downloads.

Run the icon generator's geometry, file-safety, and asset-manifest checks with:

```sh
node tests/icon-core.test.js
```

Open `tests/icon-browser-smoke.html` in a modern browser to verify that its Canvas implementation exports an opaque sRGB PNG.

If JavaScript grows beyond page-local behavior, add browser-testable functions and document the command here.

## Commit & Pull Request Guidelines

Recent commits use short imperative summaries such as `Add` and `Add math sytle and fill blank feature`. Prefer concise messages that state the visible change, for example `Add color palette export` or `Fix icon preview sizing`.

Pull requests should include a brief description, changed pages, manual verification, and screenshots for UI changes. Link issues when available.

## Agent-Specific Instructions

Keep changes narrow and static-site friendly. Do not introduce frameworks, bundlers, or dependencies unless the task explicitly requires them. Preserve existing page behavior and validate interactions in the browser after UI or script changes.
