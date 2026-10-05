# Outbreak 2: Riverbend Flu (design sketch v2)

Status: **draft for review. Nothing is built yet.** It reuses Harbor Fever's three-chapter framework (`docs/outbreak-campaign.md`): shared budget, case file with evidence to read, carry-forward rules on fixed values, snapshots and replays, harbor-style map, consequence card, town report. This doc only covers what's **different**. v2 applies Jacob and Codex's review (see "Changes from v1").

## Where it lives

A **second story inside the 🌊 Outbreak tab**. The tab shows two story cards: Harbor Fever and Riverbend Flu. Riverbend Flu **unlocks after finishing Harbor Fever once** (reaching the town report, whatever the medals). Until then its card is a **locked preview**: title, one-line premise, and "Finish Harbor Fever to unlock". Each story keeps its own run, snapshots and best medals.

## Why a second outbreak

Harbor Fever is about **drugs and resistance**. Riverbend Flu is the contrast: a **fast-mutating virus** where **vaccine matching, timing and durability** decide everything. There are **no drugs in this story**. The first version has no antivirals at all.

## The story

A river town heading into winter. A new flu strain is closing schools. The virus changes its surface protein quickly, so a vaccine made against today's strain becomes less useful as the virus moves on.

- **The truth, which the player has to discover:** a **virus**; its surface protein **drifts fast**; cases are **rising quickly**; **children and the elderly** are hit hardest; a **stable core protein** exists that a vaccine can aim at, but it gives weaker protection.
- **Shared budget:** $160k.

## The one distinctive decision: ship now, or wait for a better match?

At the start of chapter 2, before the vaccine lab, you choose **one of three buttons**. Each shows the trade-off side by side:

| Button | Strain match | Preparation time before the wave | Expected infections before you start |
|---|---|---|---|
| **Ship now** (last month's strain) | Poor | 70 days | Few |
| **Wait 2 weeks** | Fair | 56 days | Some |
| **Wait 4 weeks** (current strain) | Good | 42 days | Many (a higher protection goal) |

No button is always right. Waiting buys a better match, but less time to build immunity and a tougher goal. A durable design (more doses, a live or vector carrier, a memory-building adjuvant) makes "ship now" work. A conserved-core antigen makes the match matter less, at the cost of weaker protection. The harness enforces this (see below).

**Engine fit:** the three buttons only set the vaccine model's existing **strain drift**, **exposure day** and **protection goal**. No new mechanics.

## Chapters

### 1. Investigate
Same screen and scoring as Harbor Fever: five paid tests, evidence to read, lab-tech help for a point, case file. Each test informs the wait decision or the vaccine design:

| Test | Evidence to read | Informs |
|---|---|---|
| Electron microscope | Tiny spiked particles, far smaller than bacteria | It's a virus: this is a vaccine fight |
| Strain tracker | The surface gene from samples a week apart, with changing letters | How fast it drifts: the cost of shipping now |
| Case counter | Weekly case counts climbing steeply | How fast it spreads: the cost of waiting |
| Ward charts | Patient ages cluster in children and over-70s | Frailty: the side-effect limit |
| Core-protein scan | One protein region identical in every sample | A conserved-core vaccine is possible |

### 2. Respond: vaccinate before the first wave
The **wait choice**, then the normal vaccine lab and trial (with its usual checkpoint).

### 3. Adapt: the winter wave
The virus has drifted again. You design a vaccine for the winter strain in the normal vaccine lab. **There's no new decision type**: what changes is the situation chapter 2 handed you.

## Carry-forward (fixed values, as in Harbor Fever)

Only three things carry forward, and all of them use dials the vaccine model already has:

| From chapter 2 | Chapter 3 effect |
|---|---|
| How well the town was protected (missed the goal / met it / beat it by 15+ points) | Winter wave **large / normal / small**: exposure day and protection goal, like Harbor Fever's wave sizes |
| Antigen used: **surface spike** | **Immune escape:** the winter strain has drifted *further* from the spike (higher drift) |
| Antigen used: conserved core or antigen mix | The winter strain drifts the normal amount |
| Money spent | The budget left (same funding floor and grant rule as Harbor Fever) |

Teaching moment: **vaccinating against the part that mutates pushes the virus to mutate around you.** That's immune escape, kept simple.

Removed from v1 for focus: remaining immunity (it needed an engine change), booster-vs-redesign as a separate choice, and antivirals.

## Town report medals

- 🏥 **Town protected:** the winter wave was stopped.
- 🧬 **Kept pace with the virus:** the winter vaccine matched the winter strain well (it didn't rely on the drifted spike).
- 💰 **Budget left:** at least $20k and no emergency grant (same rule as Harbor Fever).
- 📋 **Case-file commendation:** same scoring as Harbor Fever.

The consequence card and the town map work as in Harbor Fever. The map shows schools and neighborhoods instead of the docks.

## Harness guarantees

- Every chapter 3 state (wave size × winter drift) is winnable at the funding floor. A small finite set, checked exhaustively.
- **The wait decision is real:** each of the three buttons is the best choice for some reasonable vaccine designs. If one button always wins, the check fails.
- Spike-antigen runs face more winter drift than core-antigen runs.
- Evidence readings, commendation scoring and the grant rule reuse Harbor Fever's checks.

## Open questions

1. **Story select layout:** two cards side by side in the 🌊 tab, or a dropdown above a single card? I'd suggest cards: the locked preview is easier to show.
2. **Science reward:** same as Harbor Fever (20 per finished run plus 10 per new medal)?

## Changes from v1

- **Placement settled:** a second story in the 🌊 tab, unlocked after finishing Harbor Fever once (any medals), with a locked preview before that.
- **No antivirals** in the first version. The antiviral-dish test is replaced by a **case counter**, which feeds the wait decision.
- **The wait choice is three buttons** showing match quality, preparation time and expected infections together.
- **Focus:** chapter 3 is a normal vaccine mission shaped by carry-forward. The booster-vs-redesign choice and remaining immunity are cut, which also removes the only engine change v1 needed.
