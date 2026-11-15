# Verification and audit

This project was built from scratch because the provided workspace contained no existing scaffold or Git repository.

## Executed successfully

- `npm install` (23 packages; required network access in this sandbox).
- `npm run build`: strict TypeScript compilation and Vite production bundle.
- `npm run lint`: strict TypeScript static analysis.
- `npm test` and `node tests/simulation.test.ts`: eight gameplay cases passed (determinism, boundaries, spawning, healing, player combat/scoring, enemy damage, death, obstacle collision).
- Headless Chromium with software WebGL: desktop 1280×800 and mobile viewport 390×844; canvas initialized, arena/player rendered, HUD updated, enemies spawned, keyboard movement/fire exercised, resize matched viewport, touch controls visible, and Restart reset HUD. No uncaught page errors were captured.
- Desktop screenshot visually inspected; screenshots included as `desktop.png` and `mobile.png`.

## Fixes during implementation

- Replaced a TypeScript constructor parameter property so Node's built-in type stripping can run gameplay tests without a transpiler dependency.
- Restart clears rendered entity mappings to prevent reused IDs retaining the wrong mesh type.
- Shared GPU resources are disposed at shutdown; entity removal does not dispose shared resources prematurely.
- Input clears on focus loss/visibility change, and pointer cancellation releases touch actions.
- Hidden-tab elapsed time is discarded and frame catch-up is bounded.
- Renderer initialization and frame failures are surfaced in the UI.

## Limits

Real iOS/Android devices, Safari, sustained GPU/memory profiling, actual multitouch gestures, and WebGL context recovery were not tested. Context loss requires a reload. Browser smoke testing exercised firing but did not assert a browser-rendered kill or pickup collection; these rules were verified in deterministic simulation tests. Enemies use direct pursuit rather than obstacle pathfinding.

GitHub CLI authentication succeeded when retried with network access. The earlier invalid-token diagnosis was caused by sandbox network restrictions.

Publication retry: authenticated as `contactonodo3d-byte`, but GitHub rejected both GraphQL and REST repository creation with `Resource not accessible by integration` (REST HTTP 403). No remote repository or live deployment was created. The local Pages workflow is prepared but has not run on GitHub.

## Driving-controls update

Compared public GitHub gameplay documentation (see REFERENCES.md). No source or assets copied. Added acceleration/coasting, nitro, braking, camera toggle, pause and mobile equivalents. `npm run build`, `npm run lint`, and all 12 deterministic tests passed. Local Chromium at 390×844 exercised boosted driving, pause/resume (HUD remained frozen), camera toggle, pointer brake and restart; no uncaught page errors. Real-device multitouch remains unverified.
