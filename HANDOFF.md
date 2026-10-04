# Handoff — 2026-10-04

## Where things stand

Built with Claude Code in one session. All of it works and was played through in a browser.

| Feature | State |
|---|---|
| Vaccine campaign | 5 missions: lab with carrier/antigen/adjuvant/delivery/doses, 3D trial, debrief, science and research tree. Jacob has beaten all 5. |
| Treatment campaign | 5 missions: antibiotics/antivirals, combo slot, dose/frequency/course length, resistant strains drawn in orange. |
| Sandbox | Custom pathogen builder, then either lab with everything unlocked and no budget. |
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

## Idea backlog

These were offered to Jacob but not picked yet. Confirm with him before starting one.

- Close-up animation when antibodies neutralize a virus or a drug pops a bacterium
- Sound effects and music
- Cutaway human-body view in place of the abstract vessel loop
- More treatment drugs (antifungals, a gut-microbiome side-effect meter)
- Shareable sandbox pathogens (encode the settings in a link)

## Working with Jacob

- He's not a programmer, so describe changes by what he'll see in the game.
- Commits go out as `Jacob <soulfulnevada@users.noreply.github.com>` (already set in this repo's git config).
- Run `node tools/balance.mjs` before any commit that touches game numbers.
