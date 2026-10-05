// Brute-forces every design against every mission, using the model code
// embedded in index.html between the MODEL / TX-MODEL / OUTBREAK-MODEL markers.
// Usage: node tools/balance.mjs
import fs from 'fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const between = (a, b) => html.slice(html.indexOf(a), html.indexOf(b));
const src = ['MODEL', 'TX-MODEL', 'OUTBREAK-MODEL'].map(k => between(`// ${k}-START`, `// ${k}-END`)).join('\n');
const M = new Function(src + `return { PARTS, MISSIONS, simulate, DRUGS, TX_MISSIONS, simulateTx, txCheckpointDay, challengeMet, CHALLENGE_TEXT,
  OUTBREAK, OB_WAVES, obCh2Mission, obCh3TxMission, obCh3VaxMission, obCarry, obResistAfter, obCommendation, obResistContained };`)();

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
const file = (tested, guessRight) => Object.fromEntries(M.OUTBREAK.tests.map((t, i) => [t.field, i < tested ? { tested: true, value: M.OUTBREAK.truth[t.field] } : { value: i < tested + guessRight ? M.OUTBREAK.truth[t.field] : 'wrong' }]));
ob(M.obCommendation(file(5, 0)).tier === 'gold' && M.obCommendation(file(4, 1)).tier === 'gold' && M.obCommendation(file(3, 1)).tier === 'silver'
  && M.obCommendation(file(0, 5)).tier === 'bronze' && M.obCommendation(file(0, 3)).tier === null, 'commendation tiers: tested 2, right guess 1; gold 9-10, silver 7-8, bronze 4-6');

process.exitCode = broken ? 1 : 0;
