# Project Progress Tracker
> Agents and maintainers should update this file regularly to reflect the current state of the project.

## 🎯 Current Focus
* **Goal:** Second sample project — validating theme flexibility
* **Current Phase:** Phase 2 (complete)
* **Priority:** Medium
* **Last Updated:** 2026-06-18 5:33 PM PDT
* **Notes:** social-ads-mastery restructured to 8 parts (1 per stage + intro/outro). All 8 parts + combined PDF build successfully.

## ✅ Completed Task List
* [x] Phase 2: Second sample project (social-ads-mastery)
  * [x] Create project.js with unique theme (emerald/amber/indigo palette, Space Grotesk font)
  * [x] Build all parts from main.md source with rich visual elements (19 charts, stats, tables, callouts)
  * [x] Add package.json with file:../../ dependency
  * [x] Split into 8 parts: intro, 6 stages (one each), outro — matching source structure
  * [x] Verify all 8 parts + combined PDF build successfully
* [x] Phase 1: Parts-based project orchestration with CLI
  * [x] Add `parts`, `build()`, `buildAll()` to `createProject()` in lib/project.js
  * [x] Restructure social-media-mastery sample: move build scripts to `parts/` as exported functions
  * [x] Update project.js as single entry point (`node project.js` / `node project.js intro`)
  * [x] Delete old standalone build_*.js scripts
  * [x] Add `bin/pdfy.js` CLI — auto-discovers project.js, supports `--list` and single-part builds
  * [x] Add `bin` entry to package.json for `npx pdfy`
  * [x] Add sample package.json with `file:../../` dependency so `npx pdfy` works locally
  * [x] Verify smoke test still passes (existing API unchanged)
  * [x] Verify all 4 parts build correctly via `buildAll()`
  * [x] Add combined PDF output at end of `buildAll()` + standalone `buildCombined()`
  * [x] CLI accepts multiple args + `combined` keyword (`npx pdfy intro combined`)
  * [x] Add `render` project config (`['parts', 'combined']` default) — `buildAll()` respects it, CLI args override
  * [x] Update docs (api.md, CLAUDE.md)
