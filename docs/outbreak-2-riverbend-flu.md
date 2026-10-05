# Outbreak 2: Riverbend Flu (design sketch)

Status: **draft for review. Nothing is built yet.** It reuses Harbor Fever's three-chapter framework (`docs/outbreak-campaign.md`): shared budget, case file, carry-forward rules on fixed values, snapshots and replays, town report. This doc only covers what's **different**.

## Why a second outbreak

Harbor Fever is about **drugs and resistance**: a bacterium you mostly treat. Riverbend Flu is the contrast: a **fast-mutating virus** where drugs matter little and **vaccine matching, timing and durability** decide everything.

## The story

A river town heading into winter. A new flu strain is closing schools. The virus changes its surface protein quickly, so a vaccine made against today's strain fades in usefulness as the virus moves on.

- **The truth, which the player has to discover:** a **virus**; its surface protein **drifts fast** (a noticeable shift every few weeks); **children and the elderly** are hit hardest; it barely responds to the antiviral we have; there's a **stable core protein** a vaccine can aim at, but it gives weaker protection.
- **Shared budget:** $160k.

## The one distinctive decision: ship now, or wait for a better match?

In chapter 2, before designing the vaccine, you pick **when to start vaccinating**:

| Choice | Strain match | Time before the wave hits | Town infected before you start |
|---|---|---|---|
| Ship now (last month's strain) | Poor (high drift) | 70 days | Few |
| Wait 2 weeks | Better | 56 days | Some |
| Wait 4 weeks (current strain) | Good (low drift) | 42 days | Many: a higher protection goal |

There's no always-right answer. Waiting buys a better match, but less time to build immunity, a tougher goal, and more people sick in the meantime. A durable carrier (more doses, a live or vector carrier, a memory-building adjuvant) makes "ship now" viable. A conserved-core antigen makes timing matter less, at the cost of weaker protection.

**Engine fit:** the vaccine model already has strain drift (match) and exposure day (time to build immunity). The wait choice just sets them, plus the protection goal. No new mechanics.

## Chapters

### 1. Investigate (same screen and scoring as Harbor Fever)
Five tests, each with evidence to read:

| Test | Evidence to read | Informs |
|---|---|---|
| Electron microscope | Tiny spiked particles, far smaller than bacteria | Virus, so antibiotics are useless |
| Strain tracker | The surface gene from samples a week apart, with changing letters | How fast it drifts, which shapes the wait decision |
| Antiviral dish | Infected cells barely protected by the antiviral | Drugs are a weak backup here |
| Ward charts | Patient ages cluster in children and over-70s | Frailty, so the side-effect limit matters |
| Core-protein scan | One protein region identical across every sample | A conserved-core vaccine is possible |

### 2. Respond: vaccinate the town
The **ship-now-or-wait** choice, then the normal vaccine lab and trial, with the checkpoint booster decision. Antivirals for high-risk patients are an optional, mostly weak, side purchase.

### 3. Adapt: the winter wave
The virus has drifted again. Your chapter 2 campaign left the town with some **remaining immunity**, so chapter 3 asks: **boost with the same vaccine** (cheap, partly matched) or **redesign against the new strain** (costly, well matched)?

## Carry-forward (fixed values, as in Harbor Fever)

| From chapter 2 | Chapter 3 effect |
|---|---|
| Protection achieved (fail / pass / pass by 15+ points) | **Remaining immunity** 0 / 15 / 30% added to winter protection |
| Antigen used: surface spike | Strong immune pressure: the winter strain drifts **further** from the spike (escape) |
| Antigen used: conserved core | The winter strain drifts normally |
| Money spent | The budget left (same funding floor and grant rule as Harbor Fever) |

Teaching moment: **vaccinating against the part that mutates pushes the virus to mutate around you.** That's real "immune escape", kept simple.

**One small engine addition:** "remaining immunity" adds a fixed amount to the vaccine model's protection. It's a single parameter, covered by the harness like everything else.

## Town report medals

- 🏥 **Town protected:** the winter wave was stopped.
- 🧬 **Kept pace with the virus:** your winter vaccine matched the winter strain well (by booster or redesign).
- 💰 **Budget left:** at least $20k and no emergency grant (same rule as Harbor Fever).
- 📋 **Case-file commendation:** same scoring as Harbor Fever.

## Harness guarantees (same approach as Harbor Fever)

- Every chapter 3 state (remaining immunity × winter drift × wave) is winnable at the funding floor.
- Each wait choice is the best option for **some** reasonable vaccine designs. If one choice always wins, the decision is fake, and the check fails.
- Spike-antigen runs face more winter drift than core-antigen runs.

## Open questions

1. **Where does it live?** As a second story inside the 🌊 Outbreak tab (pick Harbor Fever or Riverbend Flu), unlocked after finishing Harbor Fever once?
2. **Antivirals:** keep them as a weak optional purchase (teaching "drugs aren't the answer here"), or leave them out to keep focus?
3. **Wait choice granularity:** three options (now / 2 weeks / 4 weeks) as above, or a slider?
