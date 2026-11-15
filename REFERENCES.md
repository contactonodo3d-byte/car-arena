# Gameplay references

Public GitHub repositories reviewed on 2026-11-15. No third-party code or assets were copied.

- [MazeRush](https://github.com/luisandrelemos/MazeRush-Game): README documents W/S acceleration and reverse, A/D turning, C camera switching and Esc pause. Car Arena adapts those familiar commands with original TypeScript implementations. Space remains fire to preserve existing combat controls. README describes an academic project; GitHub's license endpoint returned 404, so no permission to reuse code was assumed.
- [AceChase](https://github.com/aceholecousins/acechase): README describes browser vehicular combat and deathmatch, race and shooting-range modes. A useful genre comparison, but its license endpoint returned 404; no code copied and no multiplayer features imported.
- [Road Reign](https://github.com/flipradmin-spec/road-reign-game): repository contained only a short README, with no reported license or usable gameplay implementation.
- [Noxel](https://github.com/Moddingear/Noxel): Unreal vehicle construction framework, unsuitable for this browser game's architecture. README places conditions on commercial code reuse; no code copied.

New original mechanics: gradual acceleration/coasting, rechargeable nitro (Shift), braking with faster turning (B), pause (P/Esc), and a top-down camera toggle (C). Touch equivalents are available. Nitro consumes 25 units/second while active and recharges at 12 units/second. It raises target forward speed from 10 to 18 units/second. Braking targets zero speed at 32 units/second². These additions preserve the fixed timestep, deterministic seeded simulation, and existing firing/repair behavior.
