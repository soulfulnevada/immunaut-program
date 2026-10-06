// Brute-forces every design against every mission, using the model code
// embedded in index.html between the MODEL / TX-MODEL / OUTBREAK-MODEL markers.
// Usage: node tools/balance.mjs
import fs from 'fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const between = (a, b) => html.slice(html.indexOf(a), html.indexOf(b));
const src = ['MODEL', 'TX-MODEL', 'OUTBREAK-MODEL'].map(k => between(`// ${k}-START`, `// ${k}-END`)).join('\n');
const M = new Function(src + `return { PARTS, MISSIONS, simulate, DRUGS, TX_MISSIONS, simulateTx, txCheckpointDay, challengeMet, CHALLENGE_TEXT,
  OUTBREAK, OB_WAVES, obCh2Mission, obCh3TxMission, obCh3VaxMission, obCarry, obResistAfter, obCommendation, obResistContained, obAfterCh2, obFinish,
  RIVERBEND, RB_WAITS, RB_WAVES, rbCh2Mission, rbCh3Mission, rbAfterCh2, rbFinish, obMastered, obWhatIf, rbWhatIf, mostImportant,
  PINECREST, PC_SUSPECTS, PC_STARTS, PC_WAIT, pcTruth, pcCh2Mission, pcCh3Mission, pcCarry, pcBroadUse, pcAfterCh2, pcFinish, pcWaitCost, pcNoWait, pcWhatIf, pcOtherSuspect, obWave, untreated };`)();

const starter = list => list.filter(p => p.unlock === 0).map(p => p.id);
const every = list => list.map(p => p.id);

console.log('VACCINES (wins / affordable designs, then best 3: stars protection% cost design)');
for (const m of M.MISSIONS) {
  for (const [label, pick] of [['starter', starter], ['all', every]]) {
    const wins = []; let n = 0;
    for (const carrier of pick(M.PARTS.carrier)) for (const antigen of pick(M.PARTS.antigen))
      for (const adjuvant of pick(M.PARTS.adjuvant)) for (const route of pick(M.PARTS.route)) for (const doses of [1, 2, 3]) {
        const s = M.simulate({ carrier, antigen, adjuvant, route, doses }, m);
        if (s.cost > m.budget) continue; n++;
        if (s.success) wins.push([s.stars, Math.round(s.protection * 100), s.cost, `${carrier}/${antigen}/${adjuvant}/${route}/${doses}`]);
      }
    wins.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    console.log(`  ${m.id} ${label.padEnd(7)} ${wins.length}/${n}`, wins.slice(0, 3).map(w => w.join(' ')).join(' | '));
  }
}

console.log('\nTREATMENTS (wins / affordable regimens, then cheapest 3: stars cost regimen)');
for (const m of M.TX_MISSIONS) {
  for (const [label, pick] of [['starter', starter], ['all', every]]) {
    const pool = pick(M.DRUGS), wins = []; let n = 0;
    for (const a of pool) for (const b of [null, ...pool]) {
      if (b && b <= a) continue;
      for (const dose of ['low', 'std', 'high']) for (const freq of [1, 2, 3]) for (const dur of m.durations) {
        const s = M.simulateTx({ a, b, dose, freq, dur }, m);
        if (s.cost > m.budget) continue; n++;
        if (s.success) wins.push([s.stars, Math.round(s.cost), `${a}+${b}/${dose}/${freq}x/${dur}d`]);
      }
    }
    wins.sort((x, y) => y[0] - x[0] || x[1] - y[1]);
    console.log(`  ${m.id} ${label.padEnd(7)} ${wins.length}/${n}`, wins.slice(0, 3).map(w => w.join(' ')).join(' | '));
  }
}

// Each mission exists to teach one lesson; these regimens must keep their outcome.
const LESSONS = [
  ['t1', { a: 'pen', dose: 'std', freq: 3, dur: 10 }, true, 'full course cures'],
  ['t1', { a: 'pen', dose: 'std', freq: 3, dur: 3 }, false, 'short course relapses'],
  ['t1', { a: 'pen', dose: 'std', freq: 1, dur: 10 }, false, 'short half-life once a day leaves gaps'],
  ['t1', { a: 'pen', dose: 'low', freq: 3, dur: 10 }, false, 'low dose fails'],
  ['t2', { a: 'pen', dose: 'std', freq: 3, dur: 7 }, false, 'antibiotics do nothing to a virus'],
  ['t2', { a: 'polym', dose: 'std', freq: 2, dur: 5 }, true, 'antiviral works'],
  ['t3', { a: 'pen', dose: 'std', freq: 3, dur: 10 }, false, 'pre-existing penicillin resistance'],
  ['t4', { a: 'polym', dose: 'std', freq: 2, dur: 45 }, false, 'monotherapy breeds resistance'],
  ['t4', { a: 'polym', dose: 'high', freq: 2, dur: 45 }, false, 'high-dose monotherapy still fails'],
  ['t4', { a: 'polym', b: 'prot', dose: 'std', freq: 1, dur: 30 }, true, 'combo therapy wins'],
  ['t5', { a: 'pen', dose: 'std', freq: 3, dur: 10 }, false, 'missed doses sink a short-lived drug'],
  ['t5', { a: 'tetra', dose: 'std', freq: 1, dur: 10 }, true, 'long-lasting drug forgives missed doses'],
];
console.log('\nLESSON CHECKS');
let broken = 0;
for (const [id, rx, want, lesson] of LESSONS) {
  const s = M.simulateTx({ b: null, ...rx }, M.TX_MISSIONS.find(m => m.id === id));
  const ok = s.success === want; if (!ok) broken++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${id} ${lesson}`);
}
// Mid-course checkpoint: keeping the plan must match no checkpoint at all, and these rescues must hold.
const CHANGES = [
  ['t1', { a: 'pen', dose: 'std', freq: 3, dur: 3 }, { a: 'pen', dose: 'std', freq: 3, dur: 10 }, true, 'extending a short course saves it'],
  ['t2', { a: 'pen', dose: 'std', freq: 3, dur: 7 }, { a: 'polym', dose: 'std', freq: 2, dur: 5 }, true, 'switching to an antiviral saves the flu patient'],
  ['t3', { a: 'pen', dose: 'std', freq: 3, dur: 10 }, { a: 'tetra', dose: 'std', freq: 1, dur: 10 }, true, 'switching off a resisted drug saves it'],
  ['t4', { a: 'polym', dose: 'std', freq: 2, dur: 45 }, { a: 'polym', b: 'prot', dose: 'std', freq: 2, dur: 45 }, false, 'adding one drug after resistance took over is too late'],
  ['t5', { a: 'pen', dose: 'std', freq: 3, dur: 10 }, { a: 'tetra', dose: 'std', freq: 1, dur: 10 }, true, 'switching to a long-lasting drug saves it'],
];
console.log('\nCHECKPOINT CHECKS');
for (const [id, rx0, fix0, want, lesson] of CHANGES) {
  const m = M.TX_MISSIONS.find(x => x.id === id), day = M.txCheckpointDay(m);
  const rx = { b: null, ...rx0 }, fix = { b: null, ...fix0 };
  // the mission's checkpoint twist applies to any change; keeping the plan must stay identical
  const plain = M.simulateTx(rx, m), kept = M.simulateTx(rx, m, { day, rx }), changed = M.simulateTx(rx, m, { day, rx: fix, ...m.twist });
  const same = plain.success === kept.success && plain.final === kept.final && Math.abs(plain.cost - kept.cost) < 1e-9 && Math.abs(plain.side - kept.side) < 1e-9;
  const ok = same && changed.success === want; if (!ok) broken++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${id} ${lesson}${same ? '' : ' (keep-plan drifted)'}`);
}
// Checkpoint twists: each mission's twist only touches the change options, and it has to bite.
console.log('\nTWIST CHECKS');
const vm = id => M.MISSIONS.find(x => x.id === id);
const TWISTS = [
  ['m2 variant: a booster helps less', () => {
    const m = vm('m2'), n = { carrier: 'inactivated', antigen: 'mix', adjuvant: 'alum', route: 'im', doses: 3 };
    return M.simulate(n, m, m.twist).protection < M.simulate(n, m, {}).protection;
  }],
  ['m4 frail residents: a booster near the limit now halts the trial', () => {
    const m = vm('m4'), n = { carrier: 'inactivated', antigen: 'spike', adjuvant: 'alum', route: 'im', doses: 2 };
    return !M.simulate(n, m, {}).halted && M.simulate(n, m, m.twist).halted;
  }],
  ['t3 kidneys: a heavier switch now goes over the side-effect limit', () => {
    const m = M.TX_MISSIONS.find(x => x.id === 't3'), day = M.txCheckpointDay(m);
    const rx = { a: 'pen', b: null, dose: 'std', freq: 3, dur: 10 }, fix = { a: 'tetra', b: null, dose: 'std', freq: 2, dur: 14 };
    return M.simulateTx(rx, m, { day, rx: fix }).success && !M.simulateTx(rx, m, { day, rx: fix, ...m.twist }).success;
  }],
];
for (const [lesson, check] of TWISTS) { const ok = check(); if (!ok) broken++; console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${lesson}`); }

// Challenges: optional goals after a win. Each must be possible but hard: passed by 2-40% of winning designs.
console.log('\nCHALLENGE CHECKS (share of winning designs that also meet it)');
const challengeShare = (m, wins) => (m.challenges || []).map(c => [c, wins.filter(s => M.challengeMet(c, s)).length / wins.length]);
const allIds = list => list.map(p => p.id);
for (const m of M.MISSIONS) {
  const wins = [];
  for (const carrier of allIds(M.PARTS.carrier)) for (const antigen of allIds(M.PARTS.antigen)) for (const adjuvant of allIds(M.PARTS.adjuvant))
    for (const route of allIds(M.PARTS.route)) for (const doses of [1, 2, 3]) {
      const s = M.simulate({ carrier, antigen, adjuvant, route, doses }, m);
      if (s.cost <= m.budget && s.success) wins.push(s);
    }
  for (const [c, share] of challengeShare(m, wins)) {
    const ok = share >= .02 && share <= .4; if (!ok) broken++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${m.id} ${M.CHALLENGE_TEXT[c.kind](c)}: ${Math.round(share * 100)}%`);
  }
}
for (const m of M.TX_MISSIONS) {
  const wins = [], drugIds = allIds(M.DRUGS);
  for (const a of drugIds) for (const b of [null, ...drugIds]) { if (b && b <= a) continue;
    for (const dose of ['low', 'std', 'high']) for (const freq of [1, 2, 3]) for (const dur of m.durations) {
      const s = M.simulateTx({ a, b, dose, freq, dur }, m);
      if (s.cost <= m.budget && s.success) wins.push(s);
    } }
  for (const [c, share] of challengeShare(m, wins)) {
    const ok = share >= .02 && share <= .4; if (!ok) broken++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${m.id} ${M.CHALLENGE_TEXT[c.kind](c)}: ${Math.round(share * 100)}%`);
  }
}

const flu = M.TX_MISSIONS.find(x => x.id === 't2');
const mild = { ...flu, growth: 1.6, critical: 6e9, days: 30 };
// Predictions: the debrief grades the player's guess against `limiter`, so each lesson case must name the right cause.
console.log('\nPREDICTION CHECKS');
const vax = (id, d) => M.simulate(d, M.MISSIONS.find(x => x.id === id)).limiter;
const tx = (id, rx) => M.simulateTx({ b: null, ...rx }, M.TX_MISSIONS.find(x => x.id === id)).limiter;
const PREDICT = [
  ['m1 one gentle dose fades before exposure', () => vax('m1', { carrier: 'subunit', antigen: 'spike', adjuvant: 'none', route: 'im', doses: 1 }), 'durability'],
  ['m4 harsh design trips the safety board', () => vax('m4', { carrier: 'live', antigen: 'spike', adjuvant: 'tlr', route: 'im', doses: 2 }), 'side'],
  ['m1 winning design has no limiter', () => vax('m1', { carrier: 'inactivated', antigen: 'spike', adjuvant: 'alum', route: 'im', doses: 2 }), 'none'],
  ['t1 3-day course is not enough drug', () => tx('t1', { a: 'pen', dose: 'std', freq: 3, dur: 3 }), 'short'],
  ['t2 antibiotic for flu is the wrong drug', () => tx('t2', { a: 'pen', dose: 'std', freq: 3, dur: 7 }), 'wrong'],
  ['t3 penicillin loses to resistance', () => tx('t3', { a: 'pen', dose: 'std', freq: 3, dur: 10 }), 'resistance'],
  ['t3 broad-spectrum is too harsh', () => tx('t3', { a: 'broad', dose: 'std', freq: 1, dur: 10 }), 'side'],
  // exposure before antibodies peak is "too late", not "faded": the fix is time, not more doses
  ['riverbend wait-4-weeks with 3 doses is too late, not faded', () => M.simulate({ carrier: 'inactivated', antigen: 'core', adjuvant: 'none', route: 'im', doses: 3 }, M.rbCh2Mission('w4', 140)).limiter, 'timing'],
  ['a dose after exposure adds nothing: 3 doses protect exactly as well as 2 when the third lands too late', () => {
    const m = M.rbCh2Mission('w4', 140), d = { carrier: 'vector', antigen: 'core', adjuvant: 'none', route: 'nasal' };
    return M.simulate({ ...d, doses: 3 }, m).protection === M.simulate({ ...d, doses: 2 }, m).protection ? 'same' : 'different';
  }, 'same'],
  // graded on the biology: a useless drug is "wrong drug" even when the immune system wins alone
  ['antibiotic for a mild virus is still the wrong drug', () => M.simulateTx({ a: 'pen', b: null, dose: 'std', freq: 3, dur: 7 }, mild).limiter, 'wrong'],
  ['a useless drug riding along in a winning combo is half right', () => { const s = M.simulateTx({ a: 'pen', b: 'polym', dose: 'std', freq: 2, dur: 5 }, flu); return s.limiter === 'none' && s.wrongToo ? 'half' : 'no'; }, 'half'],
];
for (const [lesson, run, want] of PREDICT) {
  const got = run(), ok = got === want; if (!ok) broken++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${lesson}${ok ? '' : ` (got ${got})`}`);
}

// Credit: the debrief separates "the drug saved them", "the drug sped recovery" and
// "the immune system won alone". A mild virus the body clears unaided tests the last two.
const CREDIT = [
  [flu, { a: 'polym', dose: 'std', freq: 2, dur: 5 }, 'saved', 'antiviral saves the high-risk flu patient'],
  [mild, { a: 'polym', dose: 'std', freq: 2, dur: 5 }, 'faster', 'antiviral speeds recovery from a mild virus'],
  [mild, { a: 'pen', dose: 'std', freq: 3, dur: 7 }, 'none', 'antibiotic gets no credit for a mild virus'],
];
console.log('\nCREDIT CHECKS');
for (const [m, rx0, want, lesson] of CREDIT) {
  const s = M.simulateTx({ b: null, ...rx0 }, m);
  const ok = s.effect === want; if (!ok) broken++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${lesson}${ok ? '' : ` (got ${s.effect})`}`);
}

// Outbreak campaign (docs/outbreak-campaign.md). The carry-forward rules land on a finite set of chapter 3
// starting states, so "no dead ends" is checked exhaustively over that set, not sampled.
console.log('\nOUTBREAK CHECKS');
const ob = (ok, label) => { if (!ok) broken++; console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}`); };
const allRegs = [];
for (const a of allIds(M.DRUGS)) for (const b of [null, ...allIds(M.DRUGS)]) { if (b && b <= a) continue;
  for (const dose of ['low', 'std', 'high']) for (const freq of [1, 2, 3]) for (const dur of [3, 5, 7, 10, 14]) allRegs.push({ a, b, dose, freq, dur }); }
const ch2 = M.obCh2Mission(M.OUTBREAK.budget);
const untreatedCh2 = M.simulateTx({ a: null, b: null, dose: 'std', freq: 1, dur: 0 }, ch2);
ob(untreatedCh2.hosp >= 4.5 && untreatedCh2.hosp < 5.5, `growth-curve clue "critical around day 5" matches the engine (day ${untreatedCh2.hosp?.toFixed(1)})`);
// rules behave, exhaustively over chapter 2 starting regimens
const LEVELS = { pen: [.3, .45, .6] }, OTHER = [0, .15, .6];
let rulesOk = true;
for (const rx of allRegs) {
  const s = M.simulateTx(rx, ch2), c = M.obCarry(s, ch2);
  for (const [id, r] of Object.entries(c.resist)) {
    const allowed = LEVELS[id] || OTHER, attacks = M.DRUGS.find(d => d.id === id).target === 'bacteria';
    if (!allowed.some(v => Math.abs(v - r) < 1e-9) || (!attacks && r > 0)) rulesOk = false;
  }
  if (!(c.wave in M.OB_WAVES)) rulesOk = false;
}
ob(rulesOk, 'every chapter 2 regimen carries forward allowed values only (antivirals never gain resistance)');
// every reachable chapter 3 state is winnable at the $60k floor, on both routes
const antibiotics = M.DRUGS.filter(d => d.target === 'bacteria').map(d => d.id);
let states = [{}];
for (const id of antibiotics) states = states.flatMap(st => (LEVELS[id] || OTHER).map(v => ({ ...st, [id]: v })));
let dead = 0;
for (const wave of Object.keys(M.OB_WAVES)) for (const resist of states) {
  const m = M.obCh3TxMission({ wave, resist }, M.OUTBREAK.floor);
  if (!allRegs.some(rx => { const s = M.simulateTx(rx, m); return s.success && s.cost <= M.OUTBREAK.floor; })) dead++;
}
ob(dead === 0, `treatment route: all ${states.length * 4} chapter 3 states winnable within $${M.OUTBREAK.floor}k${dead ? ` (${dead} dead ends)` : ''}`);
for (const wave of Object.keys(M.OB_WAVES)) {
  const m = M.obCh3VaxMission({ wave, resist: {} }, M.OUTBREAK.floor, false);
  let win = false;
  for (const carrier of allIds(M.PARTS.carrier)) for (const antigen of allIds(M.PARTS.antigen)) for (const adjuvant of allIds(M.PARTS.adjuvant))
    for (const route of allIds(M.PARTS.route)) for (const doses of [1, 2, 3]) { const s = M.simulate({ carrier, antigen, adjuvant, route, doses }, m); if (s.success && s.cost <= M.OUTBREAK.floor) win = true; }
  ob(win, `vaccine route: ${wave} wave winnable within $${M.OUTBREAK.floor}k`);
}
// consequences bite, and the campaign's lessons hold
const base = { pen: .3 };
const tet = resist => M.simulateTx({ a: 'tetra', b: null, dose: 'std', freq: 1, dur: 10 }, M.obCh3TxMission({ wave: 'normal', resist }, 100)).success;
ob(tet(base) && !tet({ ...base, tetra: .6 }), 'bred resistance makes the same drug fail later (Growth Blocker: clean wins, bred to 60% fails)');
ob(M.obCarry(M.simulateTx({ a: 'pen', b: null, dose: 'std', freq: 3, dur: 10 }, ch2), ch2).resist.pen === .6, 'starting on penicillin without the sensitivity test breeds penicillin resistance');
const vaxLarge = antigen => M.simulate({ carrier: 'vector', antigen, adjuvant: 'none', route: 'nasal', doses: 2 }, M.obCh3VaxMission({ wave: 'large', resist: {} }, 100, true)).success;
ob(!vaxLarge('spike') && vaxLarge('core'), 'skipping sequencing hurts: a spike vaccine misses the large wave where a conserved-core one passes');
ob(M.obResistContained(base) && !M.obResistContained({ ...base, pen: .45 }), 'resistance medal: starting levels pass, any rise fails');
// read: tested fields read correctly; helped: tested fields explained by the lab tech; misread; guessRight: untested right guesses
const file = ({ read = 0, helped = 0, misread = 0, guessRight = 0 }) => {
  const kinds = [...Array(read).fill('read'), ...Array(helped).fill('helped'), ...Array(misread).fill('misread'), ...Array(guessRight).fill('guess')];
  return Object.fromEntries(M.OUTBREAK.tests.map((t, i) => {
    const truth = M.OUTBREAK.truth[t.field], k = kinds[i];
    return [t.field, k === 'read' ? { tested: true, value: truth } : k === 'helped' ? { tested: true, helped: true, value: truth }
      : k === 'misread' ? { tested: true, value: 'wrong' } : k === 'guess' ? { value: truth } : { value: 'wrong' }];
  }));
};
const tier = f => M.obCommendation(file(f)).tier;
ob(tier({ read: 5 }) === 'gold' && tier({ read: 4, helped: 1 }) === 'gold' && tier({ read: 4, misread: 1 }) === 'silver' && tier({ read: 3, guessRight: 1 }) === 'silver'
  && tier({ helped: 5 }) === 'bronze' && tier({ guessRight: 5 }) === 'bronze' && tier({ guessRight: 3 }) === null,
  'commendation: read yourself 2, lab-tech help 1, misread 0, right guess 1; gold 9-10, silver 7-8, bronze 4-6');


// Every chapter 2 route through the money rules: endings reachable, grant exactly when needed, grant forfeits the budget medal.
{
  const reached = new Set();
  let grantOk = true, medalOk = true, granted = 0;
  const cheapWin = { a: 'tetra', b: null, dose: 'std', freq: 1, dur: 10 };
  for (const rx of allRegs) {
    const run = { spent: { tests: 7, ch2: 0, ch3: 0 }, file: {} };
    const m2 = M.obCh2Mission(M.OUTBREAK.budget - 7), s2 = M.simulateTx(rx, m2);
    if (s2.cost > m2.budget) continue;
    const next = M.obAfterCh2(run, s2, m2);
    reached.add(next.ch2.wave);
    const left = M.OUTBREAK.budget - 7 - s2.cost;
    if ((next.grant > 0) !== (left < M.OUTBREAK.floor) || left + next.grant < M.OUTBREAK.floor - 1e-9) grantOk = false;
    if (next.grant > 0) {
      granted++;
      const run3 = { ...run, spent: { tests: 7, ch2: s2.cost, ch3: 0 }, ch2: next.ch2, grant: next.grant };
      const m3 = M.obCh3TxMission(next.ch2, left + next.grant), s3 = M.simulateTx(cheapWin, m3);
      if (M.obFinish(run3, s3, m3).medals.includes('budget')) medalOk = false;
    }
  }
  ob(['small', 'normal', 'lingering', 'large'].every(w => reached.has(w)), `all four second-wave outcomes are reachable (${[...reached].join(', ')})`);
  ob(grantOk && granted > 0, `emergency grant appears exactly when the budget drops under $${M.OUTBREAK.floor}k, and tops it up to $${M.OUTBREAK.floor}k (${granted} routes)`);
  ob(medalOk, 'using the emergency grant always forfeits the budget medal');
}


// Riverbend Flu (docs/outbreak-2-riverbend-flu.md): the wait choice must be a real decision, and every winter state winnable.
console.log('\nRIVERBEND CHECKS');
{
  const designs = [];
  for (const carrier of allIds(M.PARTS.carrier)) for (const antigen of allIds(M.PARTS.antigen)) for (const adjuvant of allIds(M.PARTS.adjuvant))
    for (const route of allIds(M.PARTS.route)) for (const doses of [1, 2, 3]) designs.push({ carrier, antigen, adjuvant, route, doses });
  const budget2 = M.RIVERBEND.budget - 20;
  const best = Object.fromEntries(Object.keys(M.RB_WAITS).map(w => [w, 0])); let contested = 0;
  for (const d of designs) {
    const r = Object.keys(M.RB_WAITS).map(w => { const m = M.rbCh2Mission(w, budget2), s = M.simulate(d, m); return { w, ok: s.success && s.cost <= budget2, margin: s.protection - m.minProtect }; })
      .filter(x => x.ok).sort((a, b) => b.margin - a.margin);
    if (!r.length) continue; contested++; best[r[0].w]++;
  }
  const shares = Object.entries(best).map(([w, n]) => `${w} ${Math.round(n / contested * 100)}%`).join(', ');
  ob(Object.values(best).every(n => n / contested >= .15), `the wait choice is real: each option is the best choice for at least 15% of winning designs (${shares})`);
  let dead = 0, escapeBites = true;
  for (const wave of Object.keys(M.RB_WAVES)) {
    const wins = escape => designs.filter(d => { const s = M.simulate(d, M.rbCh3Mission({ wave, escape }, M.RIVERBEND.floor)); return s.success && s.cost <= M.RIVERBEND.floor; }).length;
    const normal = wins(false), escaped = wins(true);
    if (!normal || !escaped) dead++;
    if (escaped >= normal) escapeBites = false;
  }
  ob(dead === 0, `every winter state (3 waves × normal/escaped strain) is winnable within $${M.RIVERBEND.floor}k`);
  ob(escapeBites, 'immune escape bites: a spike-driven winter strain always leaves fewer winning designs');
  const spike = { carrier: 'vector', antigen: 'spike', adjuvant: 'alum', route: 'nasal', doses: 2 };
  const prot = escape => M.simulate(spike, M.rbCh3Mission({ wave: 'normal', escape }, 100)).protection;
  ob(prot(true) < prot(false) - .05, 'a spike vaccine matches the escaped winter strain clearly worse');
  const run = { spent: { tests: 10, ch2: 0, ch3: 0 }, file: {} }, waves = new Set();
  let grantOk = true;
  for (const d of designs) for (const w of Object.keys(M.RB_WAITS)) {
    const m = M.rbCh2Mission(w, M.RIVERBEND.budget - 10), s = M.simulate(d, m);
    if (s.cost > m.budget) continue;
    const next = M.rbAfterCh2(run, s, m, d); waves.add(next.ch2.wave);
    const left = M.RIVERBEND.budget - 10 - s.cost;
    if ((next.grant > 0) !== (left < M.RIVERBEND.floor)) grantOk = false;
    if (next.ch2.escape !== (d.antigen === 'spike')) grantOk = false;
  }
  ob(['small', 'normal', 'large'].every(w => waves.has(w)) && grantOk, `all three winter waves are reachable; grant and escape flags follow the rules (${[...waves].join(', ')})`);
  const rbFile = kinds => Object.fromEntries(M.RIVERBEND.tests.map((t, i) => [t.field, kinds[i] === 'read' ? { tested: true, value: M.RIVERBEND.truth[t.field] } : {}]));
  ob(M.obCommendation(rbFile(['read', 'read', 'read', 'read', 'read']), M.RIVERBEND).tier === 'gold' && M.obCommendation(rbFile([]), M.RIVERBEND).tier === null,
    'commendation scoring works on Riverbend\'s own tests');
}


// Outbreak Mastery: both waves protected with no emergency grant must be reachable in every story,
// and the "decision that mattered most" replay must find the real turning point in a botched run.
console.log('\nMASTERY CHECKS');
{
  // Harbor: Growth Blocker cures the first wave cleanly, and again in the small second wave
  const tests = 10, rx = { a: 'tetra', b: null, dose: 'std', freq: 1, dur: 10 };
  const m2 = M.obCh2Mission(M.OUTBREAK.budget - tests), s2 = M.simulateTx(rx, m2);
  const run = { spent: { tests, ch2: 0, ch3: 0 }, file: {} }, n2 = M.obAfterCh2(run, s2, m2);
  const run3 = { ...run, spent: { tests, ch2: s2.cost, ch3: 0 }, ch2: n2.ch2, grant: n2.grant };
  const s3 = M.simulateTx(rx, M.obCh3TxMission(n2.ch2, M.OUTBREAK.budget - tests - s2.cost));
  ob(M.obMastered({ ...run3, ch3: { success: s3.success } }), 'Harbor Fever can be mastered (Growth Blocker in both waves, no grant)');
  // a botched Harbor run: penicillin breeds resistance and a large wave, then penicillin again fails; the replay should blame chapter 2
  const pen = { a: 'pen', b: null, dose: 'std', freq: 3, dur: 10 }, sp = M.simulateTx(pen, m2), np = M.obAfterCh2(run, sp, m2);
  const botched = { ch2: np.ch2, ch3Plan: { route: 'tx', rx: { a: 'tetra', b: null, dose: 'low', freq: 2, dur: 5 } } };
  const w = M.obWhatIf(botched), top = M.mostImportant(w);
  ob(!w.actual.res.success && top && top.res.success, `Harbor what-if finds the turning point in a botched run (${top ? top.what : 'none'})`);
}
{
  // Riverbend: ship now with a 3-dose conserved-core vaccine, then a winter vaccine; no grant
  const tests = 10, d2 = { carrier: 'inactivated', antigen: 'core', adjuvant: 'none', route: 'im', doses: 3 };
  const m2 = M.rbCh2Mission('now', M.RIVERBEND.budget - tests), s2 = M.simulate(d2, m2);
  const run = { spent: { tests, ch2: 0, ch3: 0 }, file: {} }, n2 = M.rbAfterCh2(run, s2, m2, d2);
  const left = M.RIVERBEND.budget - tests - s2.cost, m3 = M.rbCh3Mission(n2.ch2, left);
  let mastered = false;
  for (const carrier of allIds(M.PARTS.carrier)) for (const antigen of allIds(M.PARTS.antigen)) for (const adjuvant of allIds(M.PARTS.adjuvant))
    for (const route of allIds(M.PARTS.route)) for (const doses of [1, 2, 3]) {
      const s3 = M.simulate({ carrier, antigen, adjuvant, route, doses }, m3);
      if (s3.success && s3.cost <= left && M.obMastered({ ch2: n2.ch2, ch3: { success: true }, grant: n2.grant })) mastered = true;
    }
  ob(mastered, 'Riverbend Flu can be mastered (ship now with a 3-dose core vaccine, then a winter vaccine, no grant)');
  // a botched Riverbend run: a spike vaccine with "wait 4 weeks" misses (large wave + escape); find a winter plan the replay can rescue
  const spike = { carrier: 'vector', antigen: 'spike', adjuvant: 'none', route: 'nasal', doses: 3 };
  const mb = M.rbCh2Mission('w4', 140), sb = M.simulate(spike, mb), nb = M.rbAfterCh2(run, sb, mb, spike);
  let found = null;
  for (const carrier of allIds(M.PARTS.carrier)) for (const antigen of allIds(M.PARTS.antigen)) for (const doses of [1, 2, 3]) {
    if (found) break;
    const p3 = { route: 'vax', design: { carrier, antigen, adjuvant: 'alum', route: 'nasal', doses } };
    const w = M.rbWhatIf({ ch2: nb.ch2, ch2Plan: { design: spike }, ch3Plan: p3 }), top = M.mostImportant(w);
    if (!w.actual.res.success && top && top.res.success) found = top.what;
  }
  ob(!sb.success && !!found, `Riverbend what-if finds the turning point in a botched run (${found || 'none'})`);
  // a mastered run must never be told an alternative that loses the first wave is "better"
  const good = M.rbWhatIf({ ch2: n2.ch2, ch2Plan: { design: d2 }, ch3Plan: { route: 'vax', design: { carrier: 'vector', antigen: 'core', adjuvant: 'alum', route: 'nasal', doses: 1 } } });
  const best = M.mostImportant(good);
  ob(!best || best.ch2ok, `what-if never prefers an alternative that loses the first wave (${best ? best.what : 'nothing better'})`);
  // ...and a run that saved only the winter wave is never told to trade it for the first wave
  let swaps = 0, checked = 0;
  for (const wait of ['w4', 'w2']) for (const carrier of allIds(M.PARTS.carrier)) for (const antigen of allIds(M.PARTS.antigen)) for (const doses of [1, 2, 3]) {
    const d = { carrier, antigen, adjuvant: 'alum', route: 'im', doses }, m = M.rbCh2Mission(wait, 999), s = M.simulate(d, m);
    if (s.success || s.halted) continue;
    for (const c3 of allIds(M.PARTS.carrier)) for (const a3 of allIds(M.PARTS.antigen)) for (const j3 of allIds(M.PARTS.adjuvant)) for (const r3 of allIds(M.PARTS.route)) {
      const p3 = { route: 'vax', design: { carrier: c3, antigen: a3, adjuvant: j3, route: r3, doses: 3 } };
      const w = M.rbWhatIf({ ch2: { success: false, wave: 'large', wait, escape: antigen === 'spike' }, ch2Plan: { design: d }, ch3Plan: p3 });
      if (!w.actual.res.success) continue;
      checked++;
      const top = M.mostImportant(w);
      if (top && !top.res.success) swaps++;
    }
  }
  ob(checked > 0 && swaps === 0, `what-if never swaps a protected winter wave for the first wave (${checked} runs checked, ${swaps} swaps)`);
}

console.log('\nPINECREST CHECKS (two suspects, the culprit picked per run)');
{
  const P = M.PINECREST, both = ['pine', 'lake'];
  // the evidence never misleads: a correct reading of the camp map or the disk test names the real culprit
  const culpritTests = ['where', 'disk'], neutral = P.tests.filter(t => !culpritTests.includes(t.field)).map(t => t.field);
  ob(both.every(c => culpritTests.every(f => {
    const t = P.tests.find(x => x.field === f), right = t.options.find(o => o[0] === M.pcTruth(c)[f]);
    return right[1].includes(M.PC_SUSPECTS[c].name) && t.result(c).includes(M.PC_SUSPECTS[c].name) && !t.result(c).includes(M.PC_SUSPECTS[M.PC_SUSPECTS[c].other].name);
  })), 'reading the camp map or the disk test correctly always names the real culprit');
  ob(neutral.every(f => M.pcTruth('pine')[f] === M.pcTruth('lake')[f]), `the other tests (${neutral.join(', ')}) never point at either suspect`);

  // the start choice: score a whole chapter 2 outcome, including what it hands chapter 3
  const W = { small: 3, normal: 2, lingering: 1, large: 0 };
  const score = (s, m) => { const c = M.pcCarry(s, m); return (s.success ? 10 : 0) + W[c.wave] - 4 * (c.resist.broad || 0) - s.cost / 100; };
  const styles = []; for (const dose of ['low', 'std', 'high']) for (const freq of [1, 2, 3]) for (const dur of [5, 7, 10, 14]) styles.push({ dose, freq, dur });
  const cp = m => M.txCheckpointDay(m), budget = P.budget - 14;
  const tally = { broad: 0, wait: 0, guess: 0 }, wins = { broad: 0, guess: 0 }; let live = 0; const known = { pine: {}, lake: {} };
  const deesc = { checked: 0, worse: 0 };
  for (const st of styles) {
    const r = { broad: 0, wait: 0, guess: 0 }; let any = false;
    for (const c of both) {
      const rr = { a: M.PC_SUSPECTS[c].drug, b: null, ...st };
      const mb = M.pcCh2Mission('broad', c, budget), sb = M.simulateTx({ a: 'broad', b: null, ...st }, mb, { day: cp(mb), rx: rr });
      const mw = M.pcCh2Mission('wait', c, budget), sw = M.simulateTx(rr, mw);
      // a blind bet on Pine Cough, switching when the culture says otherwise
      const mg = M.pcCh2Mission('pine', c, budget), sg = M.simulateTx({ a: 'pen', b: null, ...st }, mg, c === 'pine' ? null : { day: cp(mg), rx: rr });
      for (const [k, s, m] of [['broad', sb, mb], ['wait', sw, mw], ['guess', sg, mg]]) { r[k] += score(s, m) / 2; if (s.success) any = true; }
      wins.broad += sb.success ? .5 : 0; wins.guess += sg.success ? .5 : 0;
      // with the culprit known, the right narrow drug should beat covering both or waiting
      const mk = M.pcCh2Mission(c, c, budget), sk = M.simulateTx(rr, mk);
      for (const [k, v] of [['narrow', score(sk, mk)], ['broad', score(sb, mb)], ['wait', score(sw, mw)]]) known[c][k] = Math.max(known[c][k] ?? -99, v);
      // narrowing down at the culture beats a full broad course on what it leaves behind
      const full = M.simulateTx({ a: 'broad', b: null, ...st, dur: Math.max(st.dur, 7) }, mb);
      if (full.success) { deesc.checked++; if ((M.pcCarry(sb, mb).resist.broad || 0) >= (M.pcCarry(full, mb).resist.broad || 0)) deesc.worse++; }
    }
    if (!any) continue;
    live++; tally[Object.entries(r).sort((x, y) => y[1] - x[1])[0][0]]++;
  }
  const share = k => tally[k] / live;
  ob(['broad', 'wait', 'guess'].every(k => share(k) >= .15),
    `with the culprit unknown, each start is best for 15%+ of plans (broad ${Math.round(share('broad') * 100)}%, wait ${Math.round(share('wait') * 100)}%, narrow guess ${Math.round(share('guess') * 100)}%)`);
  ob(both.every(c => known[c].narrow > Math.max(known[c].broad, known[c].wait)),
    `with the culprit known, the best right-drug plan beats the best broad or wait plan (${both.map(c => `${c}: ${known[c].narrow.toFixed(1)} vs ${Math.max(known[c].broad, known[c].wait).toFixed(1)}`).join(', ')})`);
  ob(wins.guess < wins.broad, `a blind narrow guess wins less often than starting broad (${wins.guess} vs ${wins.broad} plans)`);
  ob(deesc.checked > 0 && deesc.worse === 0, `narrowing down at the culture leaves less Broad-Spectrum resistance than a full course (${deesc.checked} plans)`);
  // the report describes what the player actually did: switching onto Broad-Spectrum at the culture is not "coming off" it,
  // and only drugs that really lost ground are listed
  // (a switch that breeds resistance reads "bred", so look across switch plans for the ones that don't)
  const onto = (() => { const m = M.pcCh2Mission('lake', 'pine', budget), seen = new Set();
    for (const st of styles) seen.add(M.pcCarry(M.simulateTx({ a: 'tetra', b: null, dose: 'std', freq: 2, dur: 7 }, m, { day: cp(m), rx: { a: 'broad', b: null, ...st } }), m).broad);
    return [...seen].filter(x => x !== 'bred' && x !== 'none').join('/'); })(); // a 5-day switch after day 5 gives no doses at all
  const off = (() => { const m = M.pcCh2Mission('broad', 'pine', budget); return M.pcCarry(M.simulateTx({ a: 'broad', b: null, dose: 'std', freq: 2, dur: 7 }, m, { day: cp(m), rx: { a: 'pen', b: null, dose: 'std', freq: 3, dur: 7 } }), m).broad; })();
  ob(onto === 'onto' && off === 'short', `broad use is judged by timing: switching onto it reads "${onto}", coming off it reads "${off}"`);
  let zeros = 0;
  for (const st of styles) for (const c of both) for (const start of ['pine', 'lake', 'broad', 'wait']) {
    const m = M.pcCh2Mission(start, c, budget), a = M.PC_STARTS[start].drugs ? M.PC_STARTS[start].drugs[0] : M.PC_SUSPECTS[c].drug;
    const carry = M.pcCarry(M.simulateTx({ a, b: null, ...st }, m), m);
    if (Object.values(carry.resist).some(r => !(r > 0))) zeros++;
  }
  ob(zeros === 0, `chapter 2 never hands chapter 3 a 0% resistance entry (${zeros} found)`);
  const wc = M.pcWaitCost();
  ob(wc.grow > 5 && wc.line < 1, `waiting costs something real but survivable: untreated growth ${wc.grow.toFixed(0)}x by day ${M.PC_WAIT}, ${Math.round(wc.line * 100)}% of the way to the hospital line`);

  // every chapter 3 state is winnable at the funding floor, for both culprits
  const bact = ['pen', 'tetra', 'broad', 'last'], regs = [];
  for (const a of bact) for (const b2 of [null, ...bact]) { if (b2 && b2 <= a) continue;
    for (const dose of ['low', 'std', 'high']) for (const freq of [1, 2, 3]) for (const dur of [3, 5, 7, 10, 14]) regs.push({ a, b: b2, dose, freq, dur }); }
  let states = 0, stuck = [];
  for (const c of both) for (const wave of Object.keys(M.OB_WAVES)) for (const broad of [0, .15, .45, .6]) for (const nar of [0, .15, .6]) {
    const resist = {}; if (broad) resist.broad = broad; if (nar) resist[M.PC_SUSPECTS[c].drug] = nar;
    const m = M.pcCh3Mission({ wave, resist }, c, P.floor); states++;
    if (!regs.some(rx => { const s = M.simulateTx(rx, m); return s.success && s.cost <= P.floor; })) stuck.push(`${c}/${wave}/${broad}/${nar}`);
  }
  ob(!stuck.length, `every chapter 3 state is winnable at the $${P.floor}k floor (${states} states${stuck.length ? `; stuck: ${stuck.join(', ')}` : ''})`);

  // both truths are fair: the known-culprit narrow plans win about as often for each suspect
  const fair = both.map(c => { const m = M.pcCh2Mission(c, c, budget); return regs.filter(rx => rx.b === null && rx.a === M.PC_SUSPECTS[c].drug && M.simulateTx(rx, m).success).length; });
  ob(Math.min(...fair) >= 5 && Math.min(...fair) / Math.max(...fair) >= .4, `both culprits are fair: ${fair[0]} winning Pine Cough plans, ${fair[1]} winning Lake Fever plans`);

  // a mastered run exists for each culprit: read the evidence, go narrow, then win chapter 3 without a grant
  for (const c of both) {
    const run = { culprit: c, spent: { tests: 14, ch2: 0, ch3: 0 }, file: {} }, m2 = M.pcCh2Mission(c, c, budget);
    const win2 = regs.filter(rx => rx.b === null && rx.a === M.PC_SUSPECTS[c].drug).map(rx => [rx, M.simulateTx(rx, m2)]).filter(([, s]) => s.success).sort((x, y) => x[1].cost - y[1].cost)[0];
    const n2 = win2 && M.pcAfterCh2(run, win2[1], m2, win2[0]);
    const left = n2 && P.budget - 14 - win2[1].cost, m3 = n2 && M.pcCh3Mission(n2.ch2, c, left);
    const win3 = n2 && regs.some(rx => { const s = M.simulateTx(rx, m3); return s.success && s.cost <= left; });
    ob(!!win3 && n2.grant === 0 && n2.ch2.right && M.obMastered({ ch2: n2.ch2, ch3: { success: true }, grant: n2.grant }), `Pinecrest can be mastered when the culprit is ${M.PC_SUSPECTS[c].name}`);
  }
}

process.exitCode = broken ? 1 : 0;
