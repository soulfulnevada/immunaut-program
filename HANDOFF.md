# Handoff — 2026-10-04

## Where things stand

Built with Claude Code in one session. All of it works and was played through in a browser.

| Feature | State |
|---|---|
| Title screen | Opens the game over the turning 3D scene: logo, one-line pitch, the game's four steps and Play. Play reads "Continue" when there's a save and goes straight to an outbreak in progress. Enter starts; the top-bar logo returns to it from Mission Control. |
| Menu tabs | 🌊 Outbreak (default) · 📘 Tutorial (the vaccine and treatment missions, as two sections) · 🧪 Sandbox. |
| Vaccine campaign | 5 missions: lab with carrier/antigen/adjuvant/delivery/doses, 3D trial, debrief, science and research tree. Jacob has beaten all 5. |
| Treatment campaign | 5 missions: antibiotics/antivirals, combo slot, dose/frequency/course length, resistant strains drawn in orange. |
| Sandbox | Custom pathogen builder, then either lab with everything unlocked and no budget. |
| Battle view | Camera zooms in on the infection at exposure or treatment start (🔍/🌐 toggle). Every actor has its own shape (Y-shaped antibodies, capsule drugs, knobbed viruses, bumpy T cells, branching dendritic cells), with a key under the chart. Antibodies latch on and coated viruses grey out and stop tumbling before they pop. Resistant microbes wear orange shields that drugs bounce off. |
| Mid-trial checkpoint | Vaccines: day-10 bloodwork with an option to add a booster. Treatments: lab results (load trend, % resistant per drug) with a plan editor. The debrief says whether the change helped compared with the original plan. |
| Debriefs | Vaccines: "What drove your result" bars per part, weakest link highlighted, plus one clue. Treatments: credit compared with the untreated patient (saved them / sped recovery / recovered on their own). Both show a comparison table: no treatment, original plan and your change, or your schedule vs. the skipped booster. |
| Inspect | Click or tap anything in a trial: it pauses, rings the target and explains what it is and what it's doing right now. |
| Saved attempts | The lab keeps your last 5 runs per mission with Retry and a Compare view (last 3, changed choices highlighted). |
| Checkpoint twists | Each mission (except the first of each campaign) has a fixed twist, e.g. a new variant, borderline kidneys, a pricier booster or a patient refusing extra pills. Choices can now break the side-effect limit and fail the trial. |
| Challenges | Click a challenge in the lab to target it: its limit appears on the cost or side-effect meter with an on-track note. Each mission has 2 optional challenges (e.g. "Spend $30k or less", "Clear the infection by day 4"). A star per challenge, +10 ⚗ the first time. They replaced the old bonus stars, which were impossible in 3 vaccine missions and automatic in treatments. |
| Tissue damage | The infected tissue swells, darkens and grows sores as the infection does harm, then heals. Shown as "43% damaged · worsening/healing" with symptoms per tissue type (lungs also get an oxygen reading and log entries when it drops and recovers). Clickable. Vaccine trials show "a typical volunteer". |
| Predictions | Before a new design runs, the player guesses what will limit it. The debrief grades the guess with the real reason and keeps a streak. Skippable, and can be turned off in Mission Control. |
| Planning help | Outbreak labs preview what a plan leaves for the next chapter (or the end), warning below the $60k grant floor. Vaccine labs warn when a dose would land after exposure, or too close to it to peak. |
| Retry comparison | The results screen compares each attempt with the previous one at the same mission or chapter: what changed, and its effect on result, protection, side effects and cost. If the outbreak conditions differed (wave, exposure day, goal, strain drift, starting resistance), a warning says it isn't a like-for-like test. |
| Outbreak Mastery | ⭐ on the story card for protecting the town in both waves without emergency funding. The town report names the decision that mattered most by replaying your chapter 3 plan under alternative histories, leading with which waves would have been protected. |
| No-WebGL fallback | Shows a notice and the game still runs. |
| Mobile layout | Works at phone width (panels stack). |
| GitHub | Public repo https://github.com/soulfulnevada/immunaut-program, branch `main`. |
| Netlify | **Not live yet.** See the next section. |

## Finish the Netlify deploy

Jacob's other site (Golden Crumb Bakery) deploys from GitHub to Netlify automatically on every push to `main`. This one should work the same way:

1. Jacob logs in at https://app.netlify.com. Only he can do this step.
2. Add new site → Import an existing project → GitHub → `immunaut-program`.
3. Leave the build command and publish directory blank (it's a static `index.html` at the root), then deploy.
4. Rename the site to something like `immunaut-program` so the URL is `immunaut-program.netlify.app`.

After that, every push to `main` redeploys.

## Outbreak campaign (built)

The 🌊 Outbreak tab runs Harbor Fever: investigate (5 paid lab tests whose evidence the player reads, or asks the lab tech for a point; case file) → respond (treatment) → adapt (vaccinate or treat a second wave shaped by chapter 2) → town report (3 medals plus a case-file commendation). Design and rules: [`docs/outbreak-campaign.md`](docs/outbreak-campaign.md) (v3, as built). **Riverbend Flu** (built) is the second story card: a fast-mutating virus, vaccines only, with one new decision (ship now / wait 2 weeks / wait 4 weeks). It unlocks after Harbor Fever is finished once. Design: [`docs/outbreak-2-riverbend-flu.md`](docs/outbreak-2-riverbend-flu.md). **Pinecrest Camp** (built) is the third card, unlocked after Riverbend Flu: two look-alike bacteria, with the culprit picked at random for each new run. Chapter 2 starts narrow (bet on one suspect), broad, or waits for the culture; the culture result comes at the checkpoint, where the player can switch or narrow down. Chapter 3 is treatment only. A 🧩 challenge grid (2 culprits × 3 starts, shown on the story card, intro, chapter 2 and report) rewards winning chapter 2 every way. Design: [`docs/outbreak-3-pinecrest.md`](docs/outbreak-3-pinecrest.md).

## Idea backlog

These were offered to Jacob but not picked yet. Confirm with him before starting one.

- Sound effects and music
- Cutaway human-body view in place of the abstract vessel loop
- More treatment drugs (antifungals, a gut-microbiome side-effect meter)
- Shareable sandbox pathogens (encode the settings in a link)

## Working with Jacob

- He's not a programmer, so describe changes by what he'll see in the game.
- Commits go out as `Jacob <soulfulnevada@users.noreply.github.com>` (already set in this repo's git config).
- Run `node tools/balance.mjs` before any commit that touches game numbers.
