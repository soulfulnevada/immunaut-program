# Outbreak campaign — design sketch

Status: **draft for review. Nothing is built yet.** Jacob and Codex, mark it up; code starts once this is agreed.

## The idea

A fourth tab, **🌊 Outbreak**, next to Vaccines, Treatments and Sandbox. It holds one story told across three linked chapters. Your choices in each chapter set up the next. Every chapter runs on the game's existing engines (the treatment model, the vaccine model, checkpoints, challenges and debriefs), so the new code is mostly the glue between chapters plus one small investigation screen.

## The story: Harbor Fever

A port town. Dockworkers are coming down with a fever and a bad cough. Nobody knows what it is yet.

- **The truth, which the player has to discover:** *Harbor Fever* is a **bacterium** that infects the **lungs**. About **30% of it already resists penicillin**. Its surface protein **varies a lot between strains**, which only matters later.
- **Shared budget:** $150k for the whole outbreak. Lab tests, drugs and vaccines all come out of it.

---

## Chapter 1: Investigate

*"Samples from the dockworkers just arrived. What are we dealing with?"*

A new, small screen: a lab bench with **five tests**. Each costs a little money and reveals one clue. You can run any or all of them.

| Test | Cost | What it shows |
|---|---|---|
| Microscope | $2k | Rod-shaped cells: something big enough to see, so **not a virus** |
| Culture dish | $3k | It grows fast on a plate: **bacterium**, roughly how quickly it doubles |
| Drug sensitivity | $5k | Penicillin clears about 70% of colonies, Growth Blocker clears all: **partial penicillin resistance** |
| Patient charts | $1k | Coughing, oxygen in the low 90s: **attacks the lungs** |
| Gene sequencing | $8k | The surface-protein gene **varies between samples**: a vaccine aimed at it could miss later strains |

Then you fill in a **case file** with three answers: *what is it* (virus / bacterium), *what does it resist* (nothing / penicillin / everything we have), and *how stable is it* (stable / shifting / unknown).

**Wrong or skipped answers never block you.** They follow you instead:
- The chapter 2 lab brief shows **your** case file, not the truth. If you wrote "nothing resists", the brief says "Lab resistance test: none found", and penicillin will surprise you.
- Untested fields show as "not tested".
- The debrief grades each answer and points to the test that would have told you.

**Lesson:** evidence costs money, and skipping it costs more later.

## Chapter 2: Respond

*"The first wave is filling the clinic. Treat them."*

This is a normal **treatment mission** on the existing engine: a bacterium, the lungs, 30% penicillin resistance, a checkpoint on day 3, symptoms and oxygen, tissue damage. Budget is whatever chapter 1 left you.

**What carries forward** (all fixed rules, never random):

| What happened in chapter 2 | Effect on chapter 3 |
|---|---|
| Resistance spread to a drug you used | That drug starts chapter 3 with **60%** resistance instead of 30% (or 0) |
| Short course or low dose that relapsed | +15% resistance to the drug used |
| Patient cured cleanly | The second wave starts **smaller** (the town trusted the clinic and reported cases early) |
| Patient hospitalized | The second wave starts **bigger** and comes **sooner** (exposure on day 45 instead of 60) |
| Money spent | Less budget for chapter 3 (but see the funding floor below) |

## Chapter 3: Adapt

*"Months later, a second wave. This time you can get ahead of it."*

You choose one route:

- **Vaccinate the town:** a **vaccine mission**. Harbor Fever is a bacterium, which the vaccine engine already supports through Sandbox. Its shifting surface protein is the **strain drift**. If you sequenced it in chapter 1, the brief warns you up front. If not, it shows up as the checkpoint twist ("the new strain doesn't match").
- **Treat the second wave:** a **treatment mission** carrying the resistance you bred in chapter 2.

Both routes must be winnable from **any** chapter 2 outcome (see the no-dead-ends rules).

## Ending: the town report

A summary screen with three medals:
- 🏥 **Town protected:** chapter 3 succeeded.
- 🧫 **Resistance contained:** no drug ended above 30% resistance.
- 💰 **Budget left:** at least $20k unspent.

It also shows a short timeline of your key decisions ("Day 3: switched to Growth Blocker") and science earned. Replaying improves your best medals, like mission stars.

---

## No dead ends

- **Funding floor:** if your chapter 3 budget would fall below **$60k**, the town council tops it up to $60k ("emergency grant"). That still counts against the 💰 medal.
- **The harness checks every path:** each case-file answer × a sample of chapter 2 regimens × both chapter 3 routes must leave at least one winning design. The cheapest winning chapter 3 design must fit inside $60k.
- **Chapter snapshots:** the game saves the state at the start of each chapter, so you can replay chapter 2 or 3 from that point without redoing the whole campaign.

## Parts and progress

- **Recommended:** all parts and drugs are unlocked inside the campaign, like Sandbox, so it's self-contained and a fresh player can't get stuck without research. Science earned still goes to the main game.
- The campaign has its own save slot (`save.outbreak`) and never touches mission stars.

## What gets built (in order)

1. **Campaign state:** chapters, the shared budget, carry-forward rules and snapshots.
2. **Chapter 1 screen:** test bench, case file, grading.
3. **Chapter 2 and 3:** campaign missions built from the carry-forward state, on the existing engines.
4. **Town report** and the 🌊 tab.
5. **Harness:** a campaign section with all-paths winnable, funding-floor fit, and checks that "bred resistance makes the same drug fail later".

## Open questions

1. **Parts:** all unlocked inside the campaign (recommended), or use the player's research?
2. **Chapter 1 grading:** should a perfect case file also give a small budget bonus ("the health board funds a well-run response")? That rewards investigating well, but it also makes the investigation feel less like its own reward.
3. **Length:** three chapters to start. If it works, should a second outbreak (e.g. a fast-mutating virus where vaccines matter most) follow the same template?
