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

The game opens immediately in landscape. In portrait-only browsers, the entire playfield rotates sideways automatically, including touch coordinates. Hold the phone sideways; no fullscreen permission or orientation-lock button is required.

Drag the analog stick toward the direction you want to travel. Deflection controls speed; releasing stops the car. There is no separate accelerator or reverse control. Keyboard WASD/arrows are screen-direction alternatives. Space or the single action button uses the item held. C switches cameras, P/Esc pauses, and Restart resets the match.

All cars start unarmed. Orange boxes supply 3 rockets; purple boxes supply 5 scatter volleys; green boxes supply one repair charge (35 armor). Items are stored until used. Emptying a slot lets you collect another box; full inventory leaves boxes on the ground. Repair at full health does not waste the charge. Enemies must also collect weapons. Destroyed enemies earn 100 points. At zero armor, the match stops.

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

## Gameplay references

See [REFERENCES.md](REFERENCES.md) for reference projects and license review. The current landscape, analog steering and box-only item system is original code following the requested control design. Earlier nitro/brake commands have been removed in favor of one stick and one item button.
