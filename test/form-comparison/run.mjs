#!/usr/bin/env node
/* eslint-disable no-console */
// Records what refero does with a folder of forms, on this working tree or on any git ref, and compares two
// recordings: `record`/`compare` through the store, `browser`/`compare-browser` in a real browser. See README.md.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fillForm } from './browser/fill.mjs';

const here = fs.realpathSync.native(path.dirname(fileURLToPath(import.meta.url)));
// realpath gives the drive letter the casing vitest expects; a mismatch loads vitest twice.
const repo = fs.realpathSync.native(path.resolve(here, '../..'));
const resultsDir = path.join(here, 'results');
const formsDir = path.join(here, 'forms');

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) positional.push(arg);
    else if (['only-expressions', 'all-languages', 'dump', 'headed'].includes(arg.slice(2))) flags[arg.slice(2)] = true;
    else flags[arg.slice(2)] = argv[++i];
  }
  return { flags, positional };
}

function usage() {
  console.log(`Usage:
  node test/form-comparison/run.mjs record --label <name> [--ref <git ref>] [--forms <folder>]
       [--filter <text>] [--seeds 1] [--steps 25] [--jobs <n>] [--only-expressions] [--all-languages] [--dump]
  node test/form-comparison/run.mjs compare <label> <label>
  node test/form-comparison/run.mjs browser --label <name> [--ref <git ref>] [--forms <folder>] [--filter <text>]
       [--runs 1] [--max-actions 150] [--headed]
  node test/form-comparison/run.mjs compare-browser <label> <label>

  --ref      record that commit, branch or tag instead of the working tree
  --forms    folder with Questionnaire or Bundle json files (default: test/form-comparison/forms)
  --filter   only files whose path contains the text
  --seeds    one run per seed; each seed fills the form in differently
  --steps    edits per run
  --jobs     processes to share the forms between (default: half the cores, at most 8)
  --only-expressions  only forms with calculated or copy expressions
  --all-languages     every Questionnaire in a Bundle, not only the first
  --dump     keep the whole response after every step in the recording (use with --filter)
  --runs     browser: times each form is filled in; the comparison uses the median
  --max-actions  browser: actions per form at most
  --headed   browser: show the browser window`);
}

const git = (args, cwd = repo) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

/** Runs the recorder in `jobs` processes, each with its share of the forms, and joins what they recorded. */
async function runVitest(cwd, env, jobs) {
  const vitest = path.join(cwd, 'node_modules', 'vitest', 'vitest.mjs');
  const out = env.FORM_COMPARISON_OUT;
  const parts = Array.from({ length: jobs }, (_, job) => (jobs === 1 ? out : `${out}.part${job}`));
  const statuses = await Promise.all(
    parts.map(
      (part, job) =>
        new Promise(resolve => {
          const child = spawn(process.execPath, [vitest, 'run', '--config', 'test/form-comparison/vitest.config.ts'], {
            cwd,
            env: { ...process.env, ...env, FORM_COMPARISON_OUT: part, FORM_COMPARISON_SHARD: `${job}/${jobs}` },
            stdio: 'inherit',
          });
          child.on('exit', code => resolve(code ?? 1));
          child.on('error', () => resolve(1));
        })
    )
  );
  if (jobs > 1) {
    const recorded = parts.filter(part => fs.existsSync(part)).map(part => JSON.parse(fs.readFileSync(part, 'utf8')));
    parts.forEach(part => fs.rmSync(part, { force: true }));
    if (recorded.length === jobs) {
      fs.writeFileSync(out, JSON.stringify({ meta: recorded[0].meta, forms: Object.assign({}, ...recorded.map(part => part.forms)) }));
    }
  }
  return Math.max(...statuses);
}

/**
 * Runs `fn(dir, commit)` on the working tree, or on `ref` checked out next to the repository in a temporary
 * worktree that borrows node_modules. This folder is copied in, so both sides are driven by exactly the same
 * recorder and filler.
 */
async function withCheckout(ref, fn) {
  if (!ref) {
    const dirty = git(['status', '--porcelain']) ? ' + uncommitted changes' : '';
    return fn(repo, git(['rev-parse', '--short', 'HEAD']) + dirty);
  }
  const worktree = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'refero-form-comparison-')));
  const modulesLink = path.join(worktree, 'node_modules');
  try {
    git(['worktree', 'add', '--detach', worktree, ref]);
    fs.symlinkSync(path.join(repo, 'node_modules'), modulesLink, 'junction');
    const target = path.join(worktree, 'test', 'form-comparison');
    // The recorder and the browser page, not the forms (read from here) or what was recorded or built.
    fs.cpSync(here, target, { recursive: true, filter: source => !['forms', 'results', 'dist'].includes(path.basename(source)) });
    return await fn(worktree, git(['rev-parse', '--short', 'HEAD'], worktree));
  } finally {
    // The link must go first: removing the worktree while it is there would delete the real node_modules.
    if (fs.existsSync(modulesLink)) {
      fs.rmdirSync(modulesLink);
    }
    if (fs.existsSync(modulesLink)) {
      console.error(`Could not remove the node_modules link in ${worktree}; the worktree is left for you to remove by hand.`);
    } else {
      try {
        git(['worktree', 'remove', '--force', worktree]);
      } catch (error) {
        console.error(`Could not remove the worktree ${worktree}: ${error.message}`);
      }
    }
  }
}

function listForms(dir, filter) {
  const list = folder =>
    fs
      .readdirSync(folder, { withFileTypes: true })
      .flatMap(entry =>
        entry.isDirectory()
          ? list(path.join(folder, entry.name))
          : entry.name.toLowerCase().endsWith('.json')
            ? [path.join(folder, entry.name)]
            : []
      )
      .sort();
  return list(dir)
    .map(file => ({ file, name: path.relative(dir, file).replace(/\\/g, '/') }))
    .filter(({ name }) => !filter || name.toLowerCase().includes(filter.toLowerCase().replace(/\\/g, '/')));
}

function readJson(file) {
  const text = fs.readFileSync(file, 'utf8');
  return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
}

async function record(flags) {
  const label = flags.label ?? (flags.ref ? flags.ref.replace(/[^\w.-]+/g, '_') : 'working');
  // The forms of the working tree are used for a ref too, so both sides get the same ones.
  const forms = flags.forms ?? process.env.REFERO_FORMS_DIR ?? formsDir;
  if (!fs.existsSync(forms)) {
    console.error(`The forms folder does not exist: ${forms}`);
    return 1;
  }
  const out = path.join(resultsDir, `${label}.json`);
  fs.rmSync(out, { force: true });
  const env = {
    FORM_COMPARISON_FORMS: path.resolve(forms),
    FORM_COMPARISON_OUT: out,
    FORM_COMPARISON_LABEL: label,
    FORM_COMPARISON_REF: flags.ref ?? 'working tree',
    FORM_COMPARISON_FILTER: flags.filter ?? '',
    FORM_COMPARISON_SEEDS: flags.seeds ?? '1',
    FORM_COMPARISON_STEPS: flags.steps ?? '25',
    FORM_COMPARISON_ONLY_EXPRESSIONS: flags['only-expressions'] ? '1' : '',
    FORM_COMPARISON_ALL_LANGUAGES: flags['all-languages'] ? '1' : '',
    FORM_COMPARISON_DUMP: flags.dump ? '1' : '',
  };

  // Each process holds a form at a time in memory; half the cores leaves room for the rest of the machine.
  const jobs = Math.max(1, Number(flags.jobs ?? Math.min(8, Math.floor(os.availableParallelism() / 2))));

  const status = await withCheckout(flags.ref, (dir, commit) => runVitest(dir, { ...env, FORM_COMPARISON_COMMIT: commit }, jobs));
  if (fs.existsSync(out)) {
    const recorded = JSON.parse(fs.readFileSync(out, 'utf8'));
    console.log(`\nRecorded ${Object.keys(recorded.forms).length} forms as "${label}" (${recorded.meta.commit}): ${out}`);
  } else {
    console.error('\nNothing was recorded.');
    return status || 1;
  }
  return status;
}

function load(label) {
  const file = fs.existsSync(label) ? label : path.join(resultsDir, `${label}.json`);
  if (!fs.existsSync(file)) {
    console.error(`No recording "${label}" (${file}). Record it first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** The first place two runs of the same form, options and seed part ways; undefined when they agree. */
function firstDifference(a, b) {
  const stateA = new Map();
  const stateB = new Map();
  const apply = (state, changed) => {
    for (const [linkId, value] of Object.entries(changed)) value === null ? state.delete(linkId) : state.set(linkId, value);
  };
  for (let s = 0; s < Math.max(a.steps.length, b.steps.length); s++) {
    const stepA = a.steps[s];
    const stepB = b.steps[s];
    if (!stepA || !stepB) return { step: s, what: `one side stopped (${a.error ?? b.error ?? 'no error recorded'})` };
    if (stepA.input !== stepB.input) {
      return { step: s, edit: stepA.edit, what: s === 0 ? 'the initial response differs' : 'the response differs before the edit' };
    }
    for (let r = 0; r < Math.max(stepA.rounds.length, stepB.rounds.length); r++) {
      if (!stepA.rounds[r] || !stepB.rounds[r]) return { step: s, edit: stepA.edit, round: r, what: 'different number of rounds' };
      apply(stateA, stepA.rounds[r].changed);
      apply(stateB, stepB.rounds[r].changed);
      const linkIds = [...new Set([...stateA.keys(), ...stateB.keys()])].filter(linkId => stateA.get(linkId) !== stateB.get(linkId));
      if (linkIds.length > 0)
        return {
          step: s,
          edit: stepA.edit,
          round: r,
          what: 'different answers',
          linkIds: linkIds
            .filter(linkId => linkId !== '(response)')
            .concat(linkIds.length === 1 && linkIds[0] === '(response)' ? ['(only outside the answers)'] : []),
        };
    }
  }
  if ((a.error ?? '') !== (b.error ?? '')) return { step: a.steps.length, what: `error: "${a.error}" / "${b.error}"` };
  const asyncA = JSON.stringify(a.asyncErrors ?? []);
  const asyncB = JSON.stringify(b.asyncErrors ?? []);
  if (asyncA !== asyncB) return { step: a.steps.length, what: `same answers, but different errors along the way: ${asyncA} / ${asyncB}` };
  return undefined;
}

function compare([labelA, labelB]) {
  if (!labelA || !labelB) {
    usage();
    return 1;
  }
  const a = load(labelA);
  const b = load(labelB);
  for (const key of ['forms', 'filter', 'seeds', 'steps', 'maxAnswers', 'onlyExpressions', 'allLanguages']) {
    if (JSON.stringify(a.meta[key]) !== JSON.stringify(b.meta[key])) {
      console.warn(
        `Warning: the recordings were made with different ${key}: ${JSON.stringify(a.meta[key])} / ${JSON.stringify(b.meta[key])}`
      );
    }
  }
  console.log(`${labelA}: ${a.meta.ref} (${a.meta.commit})\n${labelB}: ${b.meta.ref} (${b.meta.commit})\n`);

  const names = [...new Set([...Object.keys(a.forms), ...Object.keys(b.forms)])].sort();
  const differences = [];
  const timings = [];
  let runs = 0;
  let identicalForms = 0;
  for (const name of names) {
    const formA = a.forms[name];
    const formB = b.forms[name];
    if (!formA || !formB) {
      differences.push(`${name}\n    only in ${formA ? labelA : labelB}`);
      continue;
    }
    const before = differences.length;
    if ((formA.error ?? '') !== (formB.error ?? '')) differences.push(`${name}\n    ${formA.error} / ${formB.error}`);
    let msA = 0;
    let msB = 0;
    for (const questionnaireA of formA.questionnaires) {
      const questionnaireB = formB.questionnaires.find(q => q.id === questionnaireA.id);
      if (!questionnaireB) {
        differences.push(`${name} [${questionnaireA.id}]\n    only in ${labelA}`);
        continue;
      }
      for (const runA of questionnaireA.runs) {
        const runB = questionnaireB.runs.find(run => run.options === runA.options && run.seed === runA.seed);
        if (!runB) continue;
        runs++;
        msA += runA.ms;
        msB += runB.ms;
        const difference = firstDifference(runA, runB);
        if (difference) {
          const where = `step ${difference.step}${difference.round !== undefined ? ` round ${difference.round}` : ''}`;
          const linkIds = difference.linkIds
            ? `: ${difference.linkIds.slice(0, 10).join(', ')}${difference.linkIds.length > 10 ? ', …' : ''}`
            : '';
          differences.push(
            `${name} [${questionnaireA.id}] options=${runA.options} seed=${runA.seed}\n    ${where}${difference.edit ? ` (${difference.edit})` : ''}: ${difference.what}${linkIds}`
          );
        }
      }
    }
    if (differences.length === before) identicalForms++;
    timings.push({ name, msA, msB });
  }

  const total = key => timings.reduce((sum, timing) => sum + timing[key], 0);
  console.log(`Forms: ${names.length}, identical: ${identicalForms}, different: ${names.length - identicalForms} (${runs} runs compared)`);
  console.log(`Time spent: ${labelA} ${Math.round(total('msA'))} ms, ${labelB} ${Math.round(total('msB'))} ms\n`);
  console.log('Slowest forms:');
  for (const timing of [...timings].sort((x, y) => Math.max(y.msA, y.msB) - Math.max(x.msA, x.msB)).slice(0, 10)) {
    console.log(`  ${String(Math.round(timing.msA)).padStart(8)} ms ${String(Math.round(timing.msB)).padStart(8)} ms  ${timing.name}`);
  }
  if (differences.length > 0) {
    console.log(`\nDifferences (first one per run):\n`);
    differences.forEach(difference => console.log(`  ${difference}`));
    return 1;
  }
  console.log('\nNo differences.');
  return 0;
}

/** Serves a folder over http on a free port. */
function serve(dir) {
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
  };
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const url = decodeURIComponent((request.url ?? '/').split('?')[0]);
      let file = path.join(dir, url === '/' ? 'index.html' : url);
      if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html');
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
      fs.createReadStream(file).pipe(response);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/** Playwright's own Chromium when it is installed (npx playwright-core install chromium), otherwise Chrome. */
async function launchBrowser(headed) {
  const { chromium } = await import('playwright-core');
  const executablePath = process.env.BROWSER_BENCH_CHROME;
  const own = !executablePath && fs.existsSync(chromium.executablePath());
  return chromium.launch({ headless: !headed, ...(executablePath ? { executablePath } : own ? {} : { channel: 'chrome' }) });
}

/** Builds the page for production, fills in every form in a browser and writes results/<label>.browser.json. */
async function browser(flags) {
  const label = flags.label ?? (flags.ref ? flags.ref.replace(/[^\w.-]+/g, '_') : 'working');
  const formsFolder = flags.forms ?? process.env.REFERO_FORMS_DIR ?? formsDir;
  const forms = listForms(formsFolder, flags.filter);
  if (forms.length === 0) {
    console.error(`No forms in ${formsFolder}${flags.filter ? ` matching "${flags.filter}"` : ''}`);
    return 1;
  }
  const runs = Number(flags.runs ?? 1);
  const options = { maxActions: Number(flags['max-actions'] ?? 150), maxSteps: Number(flags['max-steps'] ?? 40) };
  const out = path.join(resultsDir, `${label}.browser.json`);
  const result = { meta: { label, ref: flags.ref ?? 'working tree', runs, ...options, filter: flags.filter ?? '' }, forms: {} };

  const status = await withCheckout(flags.ref, async (dir, commit) => {
    result.meta.commit = commit;
    // A production build: React's development build makes the page several times slower than users get it.
    const build = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'refero-browser-bench-')));
    try {
      console.log(`Building the page (${commit}) …`);
      const vite = path.join(dir, 'node_modules', 'vite', 'bin', 'vite.js');
      execFileSync(process.execPath, [vite, 'build', '--config', 'test/form-comparison/browser/vite.config.ts', '--logLevel', 'warn'], {
        cwd: dir,
        env: { ...process.env, NODE_ENV: 'production', BROWSER_BENCH_OUT: build },
        stdio: 'inherit',
      });
      const server = await serve(build);
      const browserInstance = await launchBrowser(flags.headed);
      try {
        const url = `http://127.0.0.1:${server.address().port}/`;
        for (const { file, name } of forms) {
          const form = readJson(file);
          result.forms[name] = [];
          for (let run = 0; run < runs; run++) {
            const started = Date.now();
            try {
              const measured = await fillForm(browserInstance, url, form, options);
              result.forms[name].push(measured);
              console.log(
                `${name} run ${run + 1}: ${measured.actions} actions, input blocked ${measured.totalBlockingTimeMs} ms ` +
                  `(longest ${measured.longestTaskMs} ms), response updated p90 ${measured.qrUpdatedMs.p90} ms, ` +
                  `worker ${measured.worker.answered}/${measured.worker.posted} (${Math.round((Date.now() - started) / 1000)} s)` +
                  (measured.stopReason === 'done' ? '' : `\n    stopped: ${measured.stopReason}`)
              );
            } catch (error) {
              const message = String(error?.message ?? error);
              result.forms[name].push({ error: message.slice(0, 300) });
              console.log(`${name} run ${run + 1}: failed: ${message.split('\n')[0]}`);
            }
          }
        }
      } finally {
        await browserInstance.close();
        server.close();
      }
      return 0;
    } finally {
      fs.rmSync(build, { recursive: true, force: true });
    }
  });
  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result));
  console.log(`\nRecorded ${Object.keys(result.forms).length} forms as "${label}" (${result.meta.commit}): ${out}`);
  return status;
}

function compareBrowser([labelA, labelB]) {
  if (!labelA || !labelB) {
    usage();
    return 1;
  }
  const loadBrowser = label => load(fs.existsSync(label) ? label : path.join(resultsDir, `${label}.browser.json`));
  const a = loadBrowser(labelA);
  const b = loadBrowser(labelB);
  console.log(`${labelA}: ${a.meta.ref} (${a.meta.commit}), ${a.meta.runs} run(s) per form`);
  console.log(`${labelB}: ${b.meta.ref} (${b.meta.commit}), ${b.meta.runs} run(s) per form\n`);
  const median = list => {
    const sorted = list.filter(value => typeof value === 'number').sort((x, y) => x - y);
    return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  };
  const metrics = [
    ['input blocked (ms)', run => run.totalBlockingTimeMs],
    ['longest block (ms)', run => run.longestTaskMs],
    ['interaction p90 (ms)', run => run.interactions?.p90],
    ['response updated p90 (ms)', run => run.qrUpdatedMs?.p90],
    ['blocked on load (ms)', run => run.blockedOnLoadMs],
  ];
  const problems = [];
  const totals = metrics.map(() => [0, 0]);
  const rows = [];
  for (const name of Object.keys(a.forms)
    .filter(form => b.forms[form])
    .sort()) {
    const runsA = a.forms[name].filter(run => !run.error);
    const runsB = b.forms[name].filter(run => !run.error);
    if (runsA.length === 0 || runsB.length === 0) {
      problems.push(`${name}: no successful run in ${runsA.length === 0 ? labelA : labelB}`);
      continue;
    }
    const values = metrics.map(([, pick]) => [median(runsA.map(pick)), median(runsB.map(pick))]);
    values.forEach(([x, y], index) => {
      totals[index][0] += x ?? 0;
      totals[index][1] += y ?? 0;
    });
    rows.push({ name, values });
    const hashes = new Set([...runsA, ...runsB].map(run => run.qrHash));
    if (hashes.size > 1) problems.push(`${name}: the final response differs (${[...hashes].join(', ')})`);
    for (const [label, list] of [
      [labelA, runsA],
      [labelB, runsB],
    ]) {
      const failing = list.filter(run => run.worker.errors > 0 || run.worker.terminated > 0 || run.worker.answered < run.worker.posted);
      if (failing.length) problems.push(`${name}: the worker failed or did not answer in ${label} (${failing.length} run(s))`);
    }
  }
  const cell = (x, y) => `${String(x ?? '-').padStart(7)} ${String(y ?? '-').padStart(7)}`;
  console.log(`Totals over ${rows.length} forms (median per form), ${labelA} / ${labelB}:`);
  metrics.forEach(([title], index) =>
    console.log(`  ${title.padEnd(28)}${cell(Math.round(totals[index][0]), Math.round(totals[index][1]))}`)
  );
  console.log(`\nPer form: input blocked, then response updated p90 (ms), ${labelA} / ${labelB}:`);
  for (const row of rows.sort((x, y) => (y.values[0][0] ?? 0) - (x.values[0][0] ?? 0))) {
    console.log(`  ${cell(...row.values[0])}   ${cell(...row.values[3])}  ${row.name}`);
  }
  if (problems.length) {
    console.log('\nProblems:');
    problems.forEach(problem => console.log(`  ${problem}`));
    return 1;
  }
  console.log('\nSame final response in every form, and the worker answered every request.');
  return 0;
}

const [command, ...rest] = process.argv.slice(2);
const { flags, positional } = parseArgs(rest);
if (command === 'record') process.exit(await record(flags));
else if (command === 'compare') process.exit(compare(positional));
else if (command === 'browser') process.exit(await browser(flags));
else if (command === 'compare-browser') process.exit(compareBrowser(positional));
else {
  usage();
  process.exit(command ? 1 : 0);
}
