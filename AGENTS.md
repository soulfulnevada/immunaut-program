# Immunaut Program

A Kerbal-Space-Program-style browser game: design vaccines or drug regimens from parts, then watch a 3D immune-system trial play out. The owner, Jacob, is not a programmer. Explain changes in plain language and show results rather than code.

For current status, the Netlify deploy, and the idea backlog, read [`HANDOFF.md`](HANDOFF.md).

## Shape

- Everything lives in `index.html`: CSS, markup, and one `<script type="module">`. There's no build step. Three.js 0.160.0 loads from jsDelivr through the import map.
- Serve it to play: `npx http-server . -p 5181 -c-1`
- Script sections are marked `// ---------- name ----------`. The simulation models sit between `// MODEL-START`/`// MODEL-END` (vaccines), `// TX-MODEL-START`/`// TX-MODEL-END` (treatments) and `// OUTBREAK-MODEL-START`/`// OUTBREAK-MODEL-END` (the Outbreak campaign's rules).

## Simulation models

- Code between the markers stays pure and deterministic: no DOM, no `Math.random`, no Three.js. `tools/balance.mjs` evals that text directly, and players learn by rerunning the same design.
- After any change to a model, part, drug or mission, run `node tools/balance.mjs`. It must exit 0 (every LESSON CHECK `ok`), and each mission must keep several winning designs, including starter-part wins for missions reachable before research.
- Each mission teaches one lesson (listed in the harness's `LESSONS`). Debrief `notes` name the actual cause of failure, so a new failure mode gets its own note.
- Resistance in the treatment model is a genotype population (bitmask per drug). Mutants under half a cell are zeroed, so resistance only takes hold when many microbes survive. That rule is what makes full courses, real doses and combos matter. Keep it.
- Each trial has one mid-trial checkpoint. For vaccines, day 10 offers an extra booster: `simulate()` reruns with one more dose, and the curves before day 14 stay identical. For treatments, `txCheckpointDay(m)` lets the player change the regimen: `simulateTx(rx, m, { day, rx: newRx })`. Keeping the plan must reproduce the no-checkpoint run exactly (cost, side effects, outcome). The harness's CHECKPOINT CHECKS enforce that, plus one rescue lesson per mission.
- Treatment credit: `simulateTx()` also runs the same patient untreated (`untreated(m)`, cached per mission) and sets `effect` to `saved`, `faster` or `none`. The debrief headline and the "Recovered on their own" title come from it, so the immune system's own win is never credited to a drug. The harness's CREDIT CHECKS cover all three.
- Days in player-facing text use `dayOf(t)` (rounded down), the same as the trial log's `D6`. Rounding up anywhere brings back the day-6/day-7 mismatch.
- Checkpoint twists live on missions (`twist: { text, boostEff, sideMul, costMul, freqMax }`). They only change what a mid-trial change costs or does (`simulate(d, m, twist)` for a late booster, `{ day, rx, ...twist }` for treatments), so keeping the plan is never affected and campaign balance holds. Checkpoints show evidence (reactions so far, a typical range, an estimate band) rather than the exact outcome, and the player may choose an option that breaks the limit. Budget is the only hard block. TWIST CHECKS prove each twist bites.
- Stars are 1 for a win plus 1 per mission challenge (`challenges: [{ kind: cost|side|protect|cleared, max|min }]`, checked by `challengeMet`). The harness's CHALLENGE CHECKS keep each one possible but hard: met by 2–40% of winning designs. Retune a threshold when a model change moves it out of that band.
- Predictions are graded on the biology, not survival: a plan where no drug can touch the bug is `wrong` even if the immune system wins alone, and a winning combo carrying a useless drug sets `wrongToo` (half right). Graded against `sim.limiter` (vaccines: strength / durability / side / none; treatments: wrong / resistance / short / side / none), with `limiterWhy` as the explanation. PREDICTION CHECKS pin the lesson cases.
- Protection compared with a goal rounds down (`pctP`), so a failing 49.6% never reads as 50%.
- The results comparison table reads `trial.baseSim` (the plan before a checkpoint change), `trial.altSim` (the booster the player skipped) and `sim.untreated`.
- Outbreak stories: the 🌊 tab holds `STORIES` (Harbor Fever, Riverbend Flu). Shared screens and rules live in the outbreak section; each story object supplies its data, evidence, map, mission builders, chapter commits, consequence card and medals. Save: `save.stories[id]` (old `save.outbreak` saves migrate to `stories.harbor`). `obCommit` ignores a chapter already committed. Riverbend's design: `docs/outbreak-2-riverbend-flu.md`; RIVERBEND CHECKS keep the wait choice a real decision (each option best for at least 15% of winning designs).
- Outbreak campaign (design: `docs/outbreak-campaign.md`): `OUTBREAK-MODEL` holds the story data, chapter mission builders and carry-forward rules (`obCarry`, `obResistAfter`, `obWave`, `obCommendation`). Carry-forward values must stay on the fixed sets (resistance 0/15/30/45/60%, four wave sizes): the harness's OUTBREAK CHECKS prove every chapter 3 state is winnable at the $60k floor by enumerating that set. Campaign briefs show the player's case file (lab-tech result / your reading / your assessment / not tested), never the hidden truth; scoring is in `obFieldPoints`; chapter transitions (`obAfterCh2`, `obFinish`) are pure so the harness can check budgets, grants and medals on every route; and debriefs for `m.outbreak` describe what was observed instead of quoting lab facts.
- Dose timing: `doseTiming()` decides which doses land before exposure. Only those count toward protection and memory (a later dose still costs money and adds side effects). Exposure before antibodies peak is graded `timing` ("too late"), not `durability` ("faded"), and the clue says so. The lab warns about late doses, and the checkpoint never offers a booster that lands after exposure.
- Outbreak Mastery = both waves protected with no emergency grant (`obMastered`, ⭐ on the story card). The report's "decision that mattered most" replays the player's own chapter 3 plan under alternative histories (`obWhatIf`, `rbWhatIf`) and scores whole outcomes. `mostImportant` only suggests an alternative that keeps every wave the player actually protected (no swapping one wave for another). The text leads with which waves were protected, and explains when a lower protection number is still better (an easier wave with a lower goal).
- Each saved attempt records its conditions (`attemptCond`: wave, exposure day, goal, strain drift, or starting resistance). The retry comparison warns when they differ, since outbreak replays can face a different wave.
- `resetWorld()` also resets tissue damage, so a new lab or trial never shows the previous patient's damage.
- `simulate()` returns a `breakdown` (each part's contribution, 0–1 against the best available) and one `clue` aimed at the weakest link. The vaccine debrief shows these in place of a list of causes, so a new vaccine part needs a breakdown row and a clue.

## Content rules

- Pathogens are fictional, and the menu disclaimer ("a game, not medical advice") stays visible.
- UI copy is short, plain English for a general audience.

## Save data

- localStorage key `immunaut-save-v1`: `{ science, unlocked: [partOrDrugIds], missions: { id: { stars, done } }, sandbox, attempts: { missionId: [last 5 runs] }, predict: { right, total, streak }, noPredict, targets: { missionId: challengeKind }, stories: { harbor|riverbend: { run, snaps: { chapter: snapshot }, best, runs } }, storyId }`. Mission records also carry `ch: [challenge kinds met]`; old saves are migrated from their bonus-star count on load. Jacob has real progress in it, so new fields default when missing.
- Sandbox runs build a mission object with `sandbox: true`. They unlock everything and skip budget, science and stars.

## Gotchas

- Single-quoted JS strings break on apostrophes ("there's"). Use double quotes or rephrase, then run `node --check` on the extracted script when editing via scripts.
- The player-entered pathogen name reaches `innerHTML`, so `<>&"` get stripped on input. Do the same for any new free-text field.
- A hidden browser tab pauses `requestAnimationFrame`, so trials freeze in background or headless previews. For automated testing, temporarily expose `frame` and swap in a `setTimeout`-based rAF, then remove the hook before committing.
- Testing in a browser that holds Jacob's save: back up `immunaut-save-v1` first and restore it afterwards.
