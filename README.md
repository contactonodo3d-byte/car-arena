# Car Arena

A mobile-first procedural 3D vehicle survival game. No assets, backend, or paid services required.

## Run

Requires Node.js 22.18+ (Node 24 recommended).

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

Open the Vite URL. For phones on the same network, use your computer's LAN address and Vite port. Production hosting serves the generated `dist` folder over HTTPS. `lint` currently runs strict TypeScript static checks, not ESLint.

## Controls

W/S or up/down: forward/reverse. A/D or left/right: steer. Space: fire. Touch devices show a directional pad and a fire button with simultaneous pointer support. Restart resets the match. Green crates repair 25 armor; destroyed enemies earn 100 points. Enemies spawn faster over time, capped at 18. At zero armor, the match stops.

## Architecture

- `src/simulation.ts`: seeded random generator, state interfaces, arena collision data, movement, enemy pursuit/spawning, projectile combat, pickups, scoring and death. No DOM or Three.js dependencies. `update` advances one fixed 1/60-second tick by default.
- `src/main.ts`: application bootstrap, procedural Industrial Yard and vehicle meshes, perspective isometric-style camera, lights, renderer, entity-to-mesh synchronization, input, HUD and resource lifecycle. A bounded accumulator runs simulation at 60 Hz separately from rendering. Hidden-tab time is discarded.
- `src/style.css`: viewport overlays, safe-area spacing and touch controls.
- `tests/simulation.test.ts`: deterministic gameplay regression tests using Node's built-in test runner.
- `index.html`: accessible buttons, HUD and mobile viewport.

Rendering shares geometry and a small material palette; deleted entities release their scene references. Page exit disposes GPU resources and unregisters listeners. Renderer failures and WebGL context loss display recovery guidance. Resize updates camera aspect and canvas size; pixel ratio is capped at 2 for mobile performance.

## Implementation notes

The supplied workspace had no scaffold, so this is a new implementation authorized by the user. The core gameplay path is implemented without placeholder functions. Collision uses simple arena-aligned boxes and vehicle circles; enemies pursue directly and can be blocked by containers. There is no pathfinding, audio, persistence, or external backend. See `VERIFICATION.md` for executed checks and known verification limits.

## GitHub Pages

The included `.github/workflows/pages.yml` validates and publishes `dist` on pushes to `main`. In repository Settings → Pages, choose **GitHub Actions** as the build source. Vite uses relative asset URLs to support a repository subpath.

## Expanded controls

- **Shift**: hold nitro for extra forward speed; fuel recharges when inactive.
- **B**: brake and turn more sharply.
- **C / Camera**: switch between angled and overhead views.
- **P / Esc / Pause**: pause or resume the match.
- Mobile: Nitro and Brake buttons alongside Fire; Camera and Pause in the header.

Acceleration and coasting are gradual. HUD shows speed (arcade display units) and remaining nitro. See [REFERENCES.md](REFERENCES.md) for the GitHub gameplay comparisons and license review. All additions are original code.
