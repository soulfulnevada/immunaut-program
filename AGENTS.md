# Immunaut Program

A Kerbal-Space-Program-style browser game: design vaccines or drug regimens from parts, then watch a 3D immune-system trial play out. The owner, Jacob, is not a programmer. Explain changes in plain language and show results rather than code.

For current status, the Netlify deploy, and the idea backlog, read [`HANDOFF.md`](HANDOFF.md).

## Shape

- Everything lives in `index.html`: CSS, markup, and one `<script type="module">`. There's no build step. Three.js 0.160.0 loads from jsDelivr through the import map.
- Serve it to play: `npx http-server . -p 5181 -c-1`
- Script sections are marked `// ---------- name ----------`. The two simulation models sit between `// MODEL-START`/`// MODEL-END` (vaccines) and `// TX-MODEL-START`/`// TX-MODEL-END` (treatments).

## Simulation models

- Code between the markers stays pure and deterministic: no DOM, no `Math.random`, no Three.js. `tools/balance.mjs` evals that text directly, and players learn by rerunning the same design.
- After any change to a model, part, drug or mission, run `node tools/balance.mjs`. It must exit 0 (every LESSON CHECK `ok`), and each mission must keep several winning designs, including starter-part wins for missions reachable before research.
- Each mission teaches one lesson (listed in the harness's `LESSONS`). Debrief `notes` name the actual cause of failure, so a new failure mode gets its own note.
- Resistance in the treatment model is a genotype population (bitmask per drug). Mutants under half a cell are zeroed, so resistance only takes hold when many microbes survive. That rule is what makes full courses, real doses and combos matter. Keep it.
- Each trial has one mid-trial checkpoint. For vaccines, day 10 offers an extra booster: `simulate()` reruns with one more dose, and the curves before day 14 stay identical. For treatments, `txCheckpointDay(m)` lets the player change the regimen: `simulateTx(rx, m, { day, rx: newRx })`. Keeping the plan must reproduce the no-checkpoint run exactly (cost, side effects, outcome). The harness's CHECKPOINT CHECKS enforce that, plus one rescue lesson per mission.
- `simulate()` returns a `breakdown` (each part's contribution, 0–1 against the best available) and one `clue` aimed at the weakest link. The vaccine debrief shows these in place of a list of causes, so a new vaccine part needs a breakdown row and a clue.

## Content rules

- Pathogens are fictional, and the menu disclaimer ("a game, not medical advice") stays visible.
- UI copy is short, plain English for a general audience.

## Save data

- localStorage key `immunaut-save-v1`: `{ science, unlocked: [partOrDrugIds], missions: { id: { stars, done } }, sandbox }`. Jacob has real progress in it, so new fields default when missing.
- Sandbox runs build a mission object with `sandbox: true`. They unlock everything and skip budget, science and stars.

## Gotchas

- Single-quoted JS strings break on apostrophes ("there's"). Use double quotes or rephrase, then run `node --check` on the extracted script when editing via scripts.
- The player-entered pathogen name reaches `innerHTML`, so `<>&"` get stripped on input. Do the same for any new free-text field.
- A hidden browser tab pauses `requestAnimationFrame`, so trials freeze in background or headless previews. For automated testing, temporarily expose `frame` and swap in a `setTimeout`-based rAF, then remove the hook before committing.
- Testing in a browser that holds Jacob's save: back up `immunaut-save-v1` first and restore it afterwards.
