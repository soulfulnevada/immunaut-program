// Brute-forces every design against every mission, using the model code
// embedded in index.html between the MODEL / TX-MODEL markers.
// Usage: node tools/balance.mjs
import fs from 'fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const between = (a, b) => html.slice(html.indexOf(a), html.indexOf(b));
const src = between('// MODEL-START', '// MODEL-END') + between('// TX-MODEL-START', '// TX-MODEL-END');
const M = new Function(src + 'return { PARTS, MISSIONS, simulate, DRUGS, TX_MISSIONS, simulateTx, txCheckpointDay };')();

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
  const plain = M.simulateTx(rx, m), kept = M.simulateTx(rx, m, { day, rx }), changed = M.simulateTx(rx, m, { day, rx: fix });
  const same = plain.success === kept.success && plain.final === kept.final && Math.abs(plain.cost - kept.cost) < 1e-9 && Math.abs(plain.side - kept.side) < 1e-9;
  const ok = same && changed.success === want; if (!ok) broken++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${id} ${lesson}${same ? '' : ' (keep-plan drifted)'}`);
}
process.exitCode = broken ? 1 : 0;
