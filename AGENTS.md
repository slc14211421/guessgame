# Project Instructions

This repository is the `你比我猜` Android app project.

All agents and contributors working in this repository must strictly follow:

- `docs/coding-standards.md`
- `docs/prd.md`
- `docs/technical-development-document.md`
- `docs/development-requirements.md`

## Mandatory Workflow

Before making code, document, SVG, or configuration changes:

1. Read `docs/coding-standards.md`.
2. Check the related product and technical requirements in `docs/prd.md` and `docs/technical-development-document.md`.
3. Keep terminology, paths, data models, validation rules, visual rules, and acceptance criteria consistent across documents and implementation.

## Hard Rules

1. Use uni-app + Vue 3 + TypeScript for implementation.
2. Keep page, component, service, type, constant, and utility responsibilities separated as defined in `docs/coding-standards.md`.
3. Do not access local storage directly from pages or components; use `services/storage.ts`.
4. Do not hardcode storage keys outside `constants/storageKeys.ts`.
5. Keep core data typed with `Category`, `WordItem`, and `UserSettings`.
6. Use display-width validation for category names and words: Chinese characters count as 2, English letters, numbers, spaces, and common symbols count as 1, max width is 24.
7. Guess mode must prioritize readability: horizontal layout, super-large word text, high contrast, minimal distractions, full-page swipe area.
8. SVG page prototypes must live under `docs/svg/`, use kebab-case filenames, include `<title>` and `<desc>`, and avoid external images.
9. Do not use common AI-looking visual tropes: large purple-blue gradients, neon glow, glassmorphism, floating blobs, gradient orbs, or decorative bokeh.
10. Before finishing implementation work, verify the relevant checklist in `docs/coding-standards.md`.

## Documentation Rule

When project behavior changes, update the relevant documentation in the same change:

- Product behavior: update `docs/prd.md`.
- Technical implementation decisions: update `docs/technical-development-document.md`.
- Coding conventions or required workflow: update `docs/coding-standards.md`.
- SVG prototypes: update files in `docs/svg/` and their references in `docs/prd.md`.

