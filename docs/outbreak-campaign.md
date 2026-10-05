# Outbreak campaign — design sketch (v2)

Status: **draft for review. Nothing is built yet.** v2 settles the rules flagged in Jacob and Codex's review (see "Changes from v1" at the end).

## The idea

A fourth tab, **🌊 Outbreak**, next to Vaccines, Treatments and Sandbox. It holds one story told across three linked chapters. Your choices in each chapter set up the next. Every chapter runs on the game's existing engines (the treatment model, the vaccine model, checkpoints, debriefs), so the new code is mostly the glue between chapters plus one small investigation screen.

## The story: Harbor Fever

A port town. Dockworkers are coming down with a fever and a bad cough. Nobody knows what it is yet.

- **The truth, which the player has to discover:** *Harbor Fever* is a **bacterium** that infects the **lungs** and **grows fast** (patients turn critical around day 5 without treatment). About **30% of it already resists penicillin**. Several patients are older and frail. Its surface protein **varies a lot between strains**, which only matters in chapter 3.
- **Shared budget:** $150k for the whole outbreak. Lab tests, drugs and vaccines all come out of it.
- **Parts:** everything is unlocked inside the campaign, so failure comes from outbreak decisions, never from missing research. Budget and biological fit are the constraints. To keep it from overwhelming newcomers, the lab groups drugs by type (already true) and the campaign brief adds a one-line hint per chapter. Science earned still goes to the main game.

---

## Chapter 1: Investigate

*"Samples from the dockworkers just arrived. What are we dealing with?"*

A small lab-bench screen with **five tests**. Each answers a **different** question, each feeds a **different** decision later, and each costs a little money. You can run any or all of them.

| Test | Cost | Answers | The decision it informs |
|---|---|---|---|
| Microscope | $2k | **What kind of microbe?** Rod-shaped cells, so a bacterium, not a virus | Antibiotics vs antivirals (ch2); which vaccine target type (ch3) |
| Growth curve | $3k | **How fast does it spread?** It doubles in hours: untreated patients turn critical around day 5 | Whether a slow-acting drug (Growth Blocker) is fast enough, and how urgent the checkpoint is |
| Drug sensitivity | $5k | **What does it resist?** Penicillin clears about 70% of colonies; Growth Blocker and Broad-Spectrum clear all | Which drug to start with (ch2) |
| Patient charts | $1k | **Who's sick?** Several older dockworkers: the side-effect limit is lower than usual | How gentle the regimen must be (ch2) |
| Gene sequencing | $8k | **Is it stable?** The surface-protein gene varies between samples | Vaccine antigen choice: spike vs conserved core (ch3) |

The microscope and growth curve no longer overlap. One tells you *what* it is, the other *how fast* it moves.

### The case file

You fill in five fields, one per test: **kind, speed, resistance, patient risk, stability**. For each field you either have the **lab result** (you ran the test), make an **assessment** (you guessed), or leave it **unknown**.

Chapter 2's brief keeps these three clearly separate. Guesses never pose as findings:

| You… | The brief shows |
|---|---|
| Ran the test | **Lab result:** 30% resist penicillin |
| Guessed | **Your assessment:** no resistance (untested) |
| Left it blank | **Not tested** |

### Grading: a commendation, not cash

The chapter 1 debrief grades each field (right / wrong / not tested), names the test that would have answered it, and awards a **case-file commendation** (bronze / silver / gold) for the final report. There's **no money bonus**: good evidence pays off through better decisions in chapters 2 and 3. A bonus can be added later if testing shows investigating feels unrewarding.

## Chapter 2: Respond

*"The first wave is filling the clinic. Treat them."*

A normal **treatment mission** on the existing engine: a bacterium in the lungs, 30% penicillin resistance, a lower side-effect limit, a checkpoint on day 3, symptoms, oxygen and tissue damage. Budget is whatever chapter 1 left.

## Carry-forward rules

Calculated **once, when chapter 2 ends**. Chapter 3 starts from the result.

**Resistance, decided per drug.** Every drug used at any point in chapter 2 (including a checkpoint switch) is judged on its own, using the model's resistance tracking for that drug alone. A combo is simply two drugs, each judged separately.

| Rule (for each drug used) | Chapter 3 starting resistance to that drug |
|---|---|
| Resistant microbes to it multiplied during ch2 | **60%** |
| Otherwise, if the treatment relapsed while on it | its starting level **+15%** (penicillin 30% → 45%, others 0% → 15%) |
| Otherwise | unchanged (penicillin 30%, others 0%) |

The rules **don't stack**. The highest one that applies wins, and the cap is **60%**. Drugs never used stay at their starting level.

**Wave size and timing:**

| Ch2 outcome | Second wave |
|---|---|
| Cured | **Small:** exposure day 60, starting load as designed |
| Cured, but over the side-effect limit | **Normal:** exposure day 60, load ×3 (patients stopped coming in) |
| Hospitalized | **Large:** exposure day 45, load ×10 |

**Money:** chapter 3's budget is what's left after chapter 2.

Because every rule lands on a small set of fixed values (resistance ∈ {0, 15, 30, 45, 60}% per drug, wave ∈ {small, normal, large}), the number of possible chapter 3 starting states is **finite and small**. That's what makes the no-dead-ends guarantee testable.

## Chapter 3: Adapt

*"Months later, a second wave. This time you can get ahead of it."*

You choose one route:

- **Vaccinate the town:** a **vaccine mission** (the vaccine engine already handles bacteria). The shifting surface protein is the **strain drift**. If you sequenced it in chapter 1, the brief says so (Lab result). If you guessed, it shows as your assessment. If you skipped it, the drift shows up as the checkpoint twist.
- **Treat the second wave:** a **treatment mission** that starts with the resistance levels above.

## Emergency funding

If chapter 3's budget would fall below **$60k**, the town council provides an **emergency grant** that brings it up to $60k. The grant is **tracked separately and shown everywhere money is**: "Budget $38k + $22k emergency grant". Using any grant **forfeits the 💰 medal**, and the report shows exactly how much was granted, so overspending on purpose to get bailed out is visibly costly.

## Ending: the town report

Three medals plus the commendation:
- 🏥 **Town protected:** chapter 3 succeeded.
- 🧫 **Resistance contained:** every drug ended chapter 3 at or below its starting resistance (penicillin 30%, others 0%).
- 💰 **Budget left:** at least $20k unspent **and no emergency grant used**.
- 📋 **Case-file commendation:** bronze / silver / gold from chapter 1.

It also shows a timeline of your key decisions ("Ch1: skipped sequencing · Ch2 day 3: switched to Growth Blocker") and science earned.

## Replays

- The game saves a **snapshot at the start of each chapter**.
- **Replaying a chapter starts a new branch from that snapshot.** Everything after it (later chapters' setup, results and timeline entries) is discarded and rebuilt from your new choices. The game asks first: "Replaying chapter 2 replaces your current chapter 3."
- A run's medals count only once the run reaches the town report. Your **best medals** across runs are kept separately, like mission stars, and are never mixed with the current run's timeline.

## Testing: what the harness can guarantee

Stated precisely:

1. **Every reachable chapter 3 state is winnable (exhaustive).** The harness lists every combination of carry-forward values: resistance level per drug × wave size, at the $60k floor budget. For each, it searches **all** chapter 3 designs on both routes and requires at least one winning design under $60k. Because the state set is finite, this covers every possible chapter 2 history, including checkpoint switches.
2. **The carry-forward rules behave (exhaustive over starting regimens).** For every chapter 2 starting regimen without a checkpoint change: the computed carry-forward matches the rules table, and breeding resistance to a drug makes that same drug do worse in chapter 3.
3. **Checkpoint switches (sampled).** These are checked on a representative sample. That's fine because of (1): whatever a switch leads to, it lands in a state that (1) already covers.
4. **Lesson checks** for the campaign's teaching moments: skipping drug sensitivity and starting on penicillin breeds resistance; skipping sequencing makes a spike vaccine underperform in chapter 3; the growth curve's "critical by day 5" matches the engine.

## What gets built (in order)

1. **Campaign state:** chapters, budget and grant tracking, carry-forward rules, snapshots and branching.
2. **Chapter 1 screen:** test bench, case file (result / assessment / unknown), grading and commendation.
3. **Chapters 2 and 3:** campaign missions built from the case file and carry-forward state, on the existing engines.
4. **Town report** and the 🌊 tab.
5. **Harness:** campaign section covering (1)–(4) above.

Then playtest one complete Harbor Fever run before anything else.

## Later: a second outbreak

Same three-chapter framework, different pressure: a **fast-mutating virus**, where strain matching, timing and vaccine durability are central and drugs matter less. Built only after Harbor Fever works.

## Changes from v1

- The brief now separates **lab results, your assessments and untested fields** (v1 showed guesses as if they were lab findings).
- The emergency grant is **tracked separately** and **forfeits the 💰 medal**.
- Resistance carry-over is defined **per drug**, with timing, non-stacking, a cap and combos specified.
- Tests were redesigned so **each answers a distinct question and informs a distinct decision**. Culture dish became Growth curve.
- **Replay = new branch:** later chapters are discarded, and best medals are kept apart from the current run.
- The testing claim is now precise: **exhaustive over the finite carry-forward state set**, exhaustive over starting regimens, sampled for checkpoint switches.
- Settled answers: **all parts unlocked** (with grouping and hints), **commendation instead of cash**, and a **second outbreak later**, with a fast-mutating virus.
