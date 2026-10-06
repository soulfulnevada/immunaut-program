# Outbreak 3: Pinecrest Camp (design sketch v2)

Status: **built (v2), with three changes found while building** (see "Changes while building"). Tuned values: budget $150k, culture 3 days (`PC_WAIT`), 5 days once antibiotics have started (`PC_LATE`), bug growth 1.2 (untreated campers turn critical around day 5), side-effect limit 45%, Broad-Spectrum carry-forward 0 / 15% / 45% / 60% (none / came off at the culture / kept going / bred resistance). With the culprit unknown, the harness finds broad best for 48% of plans, a narrow guess 30% and waiting 22%. It reuses the three-chapter framework from Harbor Fever (`docs/outbreak-campaign.md`) and Riverbend Flu (`docs/outbreak-2-riverbend-flu.md`): shared budget, case file with evidence to read, carry-forward on fixed values, snapshots and replays, town map, consequence card, town report, Mastery. This doc only covers what's **different**.

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

If the culprit were always the same, a second playthrough would just give the answer away. So **when you start a new run, the game secretly picks A or B** and saves it with the run. It stays fixed through **retries, replays from snapshots and page reloads**, so retries remain fair comparisons. Only "New run" picks again. The model stays pure and deterministic: the truth is an input to the run, never a random roll during it.

## Chapter 1: Investigate (honest but incomplete evidence)

Same screen as before: paid tests, evidence to read, lab-tech help for a point. **No test ever misleads.** Every test that points somewhere points at the real culprit, and its picture is drawn from the truth of this run. The uncertainty comes from **which tests you pay for and how well you read them**, not from tests lying.

| Test | Cost | Evidence to read | What it tells you |
|---|---|---|---|
| Microscope | $2k | Rod-shaped bacteria | Both suspects look like this, so it **can't tell them apart**. It rules out a virus. |
| Camp map | $3k | Where sick campers sleep and swim | **Points at the culprit:** sick campers cluster around the lake (B) or spread across the cabins (A). |
| Penicillin disk test | $5k | A dish with a penicillin disk: a clear ring around it, or bacteria growing right up to it | **Points at the culprit:** a clear ring means penicillin works (A); no ring means it doesn't (B). |
| Patient charts | $1k | Ages and symptoms | No help with the culprit. Tells you how gentle the treatment must be (the side-effect limit). |

So a player who runs and correctly reads **either** the camp map **or** the disk test knows the culprit. The tension:

- **Those two tests cost $8k together**, out of a tight budget. Skipping them saves money but leaves you guessing.
- **Reading them takes skill.** Asking the lab tech costs a commendation point, and misreading sends you narrow on the wrong drug.
- Each test is a different kind of evidence (where people got sick, and how the bug reacts to a drug), so both are worth learning to read.

The case file scores readings as before: read right 2, lab-tech help 1, misread 0, a right guess 1.

**The culture** isn't a chapter 1 test. It's the "wait for the culture" button in chapter 2: free proof, but it costs time.

## Chapter 2: Respond (the distinctive decision)

Before the lab opens, you choose **how to start treatment**, as three side-by-side buttons like Riverbend's:

| Button | What happens | Risk |
|---|---|---|
| **Narrow now** (your best guess) | Penicillin if you think A, Growth Blocker if you think B. Cheap and gentle, no broad resistance. | A wrong guess means patients go untreated until the checkpoint. |
| **Broad now** | Broad-Spectrum covers both suspects from day 0. | More side effects and cost, and it breeds broad-spectrum resistance that shows up in chapter 3. |
| **Wait for the culture** | No guessing: the lab opens with the culprit confirmed, and you treat the right bug narrowly. | **Treatment starts 3 days late.** |

**The cost of waiting is shown up front.** Before you choose, the button shows a small preview of an untreated patient's infection on day 0 vs day 3, against the hospital line ("By day 3, untreated campers are about 4× sicker, and the sickest are close to the hospital line"). In the lab, the brief shows "Treatment starts on day 3" in warning colors, and the debrief credits or blames the delay by name, for example: "The 3-day wait let the infection grow 4×. Treating right away would have kept 2 campers out of the hospital."

**The checkpoint is where the culture comes back.** It arrives on day 3 of treatment, the existing treatment checkpoint, and reveals the truth. You can then change the plan as usual:

- Started **broad** → **narrow down** to the right drug ("de-escalation"). This is often the smart real-world move, and it limits the resistance bred.
- Guessed **narrow and wrong** → switch to the right drug and rescue the patients, late.
- Guessed **narrow and right** → keep the plan.
- **Waited** → there's nothing left to reveal, so it's the usual treatment checkpoint.

**Engine fit:** no new mechanics. A suspect is just the Harbor-style bug with penicillin resistance set to 0% (A) or 100% (B). "Wait for the culture" only moves the treatment start day. The checkpoint already exists.

## Chapter 3: Adapt (treatment only)

The truth is now known. A second wave of the **same culprit** arrives, shaped by chapter 2. **Chapter 3 is treatment only.** Identifying the culprit and adapting your treatment to it is this outbreak's identity, so there's no vaccine route (unlike Harbor Fever). The brief names the confirmed culprit and the resistance left behind, and you design the regimen.

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
- **Evidence is reliable:** for both culprits, a correct reading of the camp map or the disk test always names the true culprit, and the microscope and patient charts never point either way.
- **Waiting is a real option:** for some evidence states (no culprit test run, or a misreading risk the player avoided), waiting for the culture wins. For others, its delay loses to treating now.
- **The culprit is fixed per run:** a retry, a replay from a snapshot or a reload never changes it; only a new run picks again.
- **De-escalating beats a full broad course** on chapter 3 resistance, for every winning chapter 2 plan.
- Every chapter 3 state is winnable at the $60k floor, whichever suspect is true (checked exhaustively, as before).
- **Both truths are fair:** neither suspect makes the story much easier than the other.

## Challenge grid (added after Codex's play-test)

Six squares: each culprit × narrow from day 0 / broad then narrow at the culture / wait for the culture. A square needs a chapter 2 cure that finishes on the right narrow drug by its own route (a wrong bet rescued at the culture, or a broad course kept past it, doesn't count). Replaying chapter 2 can fill another square against the same culprit. +10 science per new square; the story card shows 🧩 n/6. New runs lean 3:1 toward a culprit with open squares instead of forcing it, so the investigation still matters.

## Changes while building

- **The culture is slower once antibiotics have started (day 5 instead of day 3).** Without this, a blind narrow guess was never worse than waiting: a wrong guess switched drugs on day 3, the same day a waiter started treatment. That made "Wait for the culture" pointless. This is real medicine, simplified: hospitals take cultures before the first dose because antibiotics in the sample slow or spoil the result. Now a wrong guess loses 5 days and waiting loses 3.
- **The culture checkpoint opens even if the infection has already cleared**, with a "Stop today" course option, so a broad start can always come off Broad-Spectrum when the culture names the culprit.
- **Bug growth is 1.2 instead of Harbor Fever's 1.4**, so waiting 3 days is costly (about 19× more bacteria, 75% of the way to the hospital line) but survivable with a good plan.

## Changes from v1

- **The culprit is randomized per new run**, then saved with the run, so retries, replays and reloads never change it.
- **Evidence is reliable:** no test misleads. The 75%-accurate swab is replaced by a penicillin disk test that always shows the truth. Uncertainty now comes from which tests you buy and how you read them.
- **All three start buttons stay.** Waiting for the culture shows its cost up front (a preview, the day-3 warning in the brief, and the debrief naming the delay's effect).
- **Chapter 3 is treatment only.** No vaccine route for now.
