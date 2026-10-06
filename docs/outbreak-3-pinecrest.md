# Outbreak 3: Pinecrest Camp (design sketch v1)

Status: **sketch for review. Nothing is built yet.** It reuses the three-chapter framework from Harbor Fever (`docs/outbreak-campaign.md`) and Riverbend Flu (`docs/outbreak-2-riverbend-flu.md`): shared budget, case file with evidence to read, carry-forward on fixed values, snapshots and replays, town map, consequence card, town report, Mastery. This doc only covers what's **different**.

## Where it lives

A **third story card** in the 🌊 Outbreak tab. It unlocks after finishing Riverbend Flu once, with a locked preview before that (same rule as Riverbend).

## Why a third outbreak

| Story | The skill it tests |
|---|---|
| Harbor Fever | Treat without breeding resistance |
| Riverbend Flu | Time and match a vaccine against a moving target |
| **Pinecrest Camp** | **Act before the evidence is complete:** a narrow, targeted treatment or broad protection? |

Real doctors face this every day. A sick patient can't wait days for a lab culture, so they often **start broad and narrow down** once results come back. Going broad when you didn't need to breeds resistance and harms good gut bacteria. Going narrow on a wrong guess leaves patients untreated.

## The story

A summer camp in the hills. Campers and counselors are coming down with fever and a chest infection. The camp nurse has two suspects, and early tests can't fully tell them apart.

- **Suspect A, "Pine Cough":** a bacterium that **penicillin cures** cleanly. Gentle, cheap treatment works.
- **Suspect B, "Lake Fever":** a look-alike bacterium that **shrugs off penicillin** but falls to the Growth Blocker.
- **Broad-Spectrum** kills both, but it's harder on patients' guts, costs more, and resistance to it comes easily.
- **Shared budget:** about $150k (to be tuned by the harness).

## The truth is picked per run

If the culprit were always the same, a second playthrough would just give the answer away. So **when you start a new run, the game secretly picks A or B**. It stays fixed for that run, including replays from snapshots, so retries remain fair comparisons. The model stays pure and deterministic: the truth is an input to the run, never a random roll during it.

## Chapter 1: Investigate (incomplete evidence)

Same screen as before: paid tests, evidence to read, lab-tech help for a point. The difference: **most tests lean one way but don't prove it.** Each reading is "leans A", "leans B" or "can't tell".

| Test | Evidence to read | What it really tells you |
|---|---|---|
| Microscope | Rod-shaped bacteria | Both suspects look like this. **Can't tell**, but it rules out a virus. |
| Camp map | Where sick campers sleep and swim | Clustered near the lake leans B; spread across the cabins leans A. |
| Quick swab test | A faint or clear test line | Right about 3 times in 4. A clue, not proof. |
| Patient charts | Ages and symptoms | How gentle the treatment must be (the side-effect limit) |
| **Culture** | Grows the real bug in a dish | **The only proof**, but results take 3 days. See chapter 2. |

The case file still scores how well you read each test. For the leaning tests, "leans B" is the right reading if the evidence leans B, even when the truth turns out to be A. That rewards reading the evidence well, not getting lucky.

## Chapter 2: Respond (the distinctive decision)

Before the lab opens, you choose **how to start treatment**, as three side-by-side buttons like Riverbend's:

| Button | What happens | Risk |
|---|---|---|
| **Narrow now** (your best guess) | Penicillin if you think A, Growth Blocker if you think B. Cheap and gentle, no broad resistance. | A wrong guess means patients go untreated until the checkpoint. |
| **Broad now** | Broad-Spectrum covers both suspects from day 0. | More side effects and cost, and it breeds broad-spectrum resistance that shows up in chapter 3. |
| **Wait for the culture** | No guessing: you treat the right bug narrowly. | Treatment starts 3 days late, so patients are much sicker and the hospital line is close. |

**The checkpoint is where the culture comes back.** It arrives on day 3 of treatment, the existing treatment checkpoint, and reveals the truth. You can then change the plan as usual:

- Started **broad** → **narrow down** to the right drug ("de-escalation"). This is often the smart real-world move, and it limits the resistance bred.
- Guessed **narrow and wrong** → switch to the right drug and rescue the patients, late.
- Guessed **narrow and right** → keep the plan.

**Engine fit:** no new mechanics. A suspect is just the Harbor-style bug with penicillin resistance set to 0% (A) or 100% (B). "Wait for the culture" only moves the treatment start day. The checkpoint already exists.

## Chapter 3: Adapt

The truth is now known. A second wave arrives, shaped by chapter 2. There's no new decision type: you treat or vaccinate, as in Harbor Fever.

| From chapter 2 | Chapter 3 effect |
|---|---|
| How well chapter 2 went (cleared, slow, hospitalized) | Wave size: small / normal / large |
| How much Broad-Spectrum was used (none / narrowed at the checkpoint / the full course) | Starting broad-spectrum resistance: 0% / 15% / 45% |
| Money spent | Budget left (same $60k funding floor and grant rule) |

Teaching moment: **broad protection now has a cost later.** Narrowing down at the checkpoint keeps most of the safety and avoids most of the cost.

## Town report medals

- 🏥 **Camp protected:** the second wave was stopped.
- 🎯 **Right drug, right bug:** you finished chapter 2 on a narrow drug that matched the real culprit, whether you guessed right or narrowed down from broad.
- 💰 **Budget left:** at least $20k and no emergency grant.
- 📋 **Case-file commendation:** same scoring as before.

**Mastery** keeps the same rule: both waves protected, no emergency funding. The "decision that mattered most" replay would include "what if the other suspect had been the culprit?". That makes it clear whether your plan was **robust** or just **lucky**.

## Harness guarantees

- **The start choice is real:** each of the three buttons is the best choice for some evidence states. Strong evidence favors narrow, ambiguous evidence favors broad-then-narrow, and a frail camp or a big budget favors waiting.
- **Narrow on a blind guess is risky:** with no tests run, "narrow now" must lose more often than "broad now".
- **De-escalating beats a full broad course** on chapter 3 resistance, for every winning chapter 2 plan.
- Every chapter 3 state is winnable at the $60k floor, whichever suspect is true (checked exhaustively, as before).
- **Both truths are fair:** neither suspect makes the story much easier than the other.

## Open questions

1. **Truth per run** (my recommendation) **or always the same culprit?** A fixed culprit is simpler but spoils replays.
2. **Is three start buttons right,** or should "wait for the culture" be cut to keep it to narrow vs broad?
3. **Chapter 3 route:** treatment only (simpler, keeps the focus on antibiotics), or treat-or-vaccinate as in Harbor Fever?
