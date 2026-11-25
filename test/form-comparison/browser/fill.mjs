/* eslint-disable no-console */
// Fills in one form in a real browser the way a user does and measures what the user experiences. Used by
// run.mjs (`browser`); see README.md.
//
// The page is the production build of index.html/main.tsx in this folder. The user's actions: picks the first
// option in drop-downs, the first option of radio groups (often "Ja", which shows the follow-up questions),
// ticks checkboxes, types in text, number and date fields, and presses "Neste" through a step form. The same
// choices every run.
//
// What is measured:
// - input blocking: long tasks on the main thread (total blocking time, the longest) and Event Timing, the time
//   from a click or key press until the screen shows it;
// - when the QuestionnaireResponse is updated after each action (the answer, then calculations and enableWhen);
// - the web worker: requests sent and answered, errors, fallback to the main thread;
// - a hash of the final response, so two versions can be checked for ending up with the same answers.

const SETTLE_QUIET_MS = 600;
const SETTLE_TIMEOUT_MS = 30000;

/** Runs in the page before refero starts. */
function instrument() {
  window.__bench = { longTasks: [], interactions: [], qrChanges: [] };
  new PerformanceObserver(list => list.getEntries().forEach(entry => window.__bench.longTasks.push(entry.duration))).observe({
    type: 'longtask',
    buffered: true,
  });
  new PerformanceObserver(list =>
    list.getEntries().forEach(entry => {
      if (entry.interactionId) window.__bench.interactions.push({ id: entry.interactionId, ms: entry.duration });
    })
  ).observe({ type: 'event', durationThreshold: 16, buffered: true });

  window.__bench.worker = { created: 0, posted: 0, answered: 0, errors: 0, terminated: 0, answerMs: [] };
  const NativeWorker = window.Worker;
  window.Worker = class extends NativeWorker {
    constructor(...args) {
      super(...args);
      const stats = window.__bench.worker;
      stats.created++;
      const sent = [];
      const post = this.postMessage.bind(this);
      this.postMessage = (...message) => {
        stats.posted++;
        sent.push(performance.now());
        return post(...message);
      };
      this.addEventListener('message', () => {
        stats.answered++;
        const at = sent.shift();
        if (at !== undefined) stats.answerMs.push(performance.now() - at);
      });
      this.addEventListener('error', () => stats.errors++);
      const terminate = this.terminate.bind(this);
      this.terminate = () => {
        stats.terminated++;
        return terminate();
      };
    }
  };

  // Resolves when the page has had no DOM changes for `quiet` ms; gives the time of the last change after start.
  window.__bench.settle = (start, quiet, timeout) =>
    new Promise(resolve => {
      let last = performance.now();
      const observer = new MutationObserver(() => (last = performance.now()));
      observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
      const check = () => {
        const now = performance.now();
        if (now - last >= quiet || now - start > timeout) {
          observer.disconnect();
          resolve(Math.max(0, last - start));
        } else setTimeout(check, 50);
      };
      setTimeout(check, 50);
    });
}

const stats = list => {
  const sorted = list.filter(value => value !== null && value !== undefined).sort((a, b) => a - b);
  const at = p => Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0);
  return {
    n: sorted.length,
    median: at(0.5),
    p90: at(0.9),
    max: Math.round(sorted.at(-1) ?? 0),
    sum: Math.round(sorted.reduce((a, b) => a + b, 0)),
  };
};

const textFor = (label, placeholder, id) => {
  if (/dato|date|dd\.mm/i.test(placeholder) || /date/i.test(id)) return '01.01.1980';
  if (/telefon|mobil|tlf/i.test(label)) return '91234567';
  if (/postn/i.test(label)) return '0150';
  if (/e-?post/i.test(label)) return 'test@example.com';
  if (/fødselsnummer|personnummer/i.test(label)) return '01017012345';
  return 'Test';
};

/**
 * Fills in `form` (a Questionnaire or Bundle) on the page at `url` and returns the measurements.
 * @param {import('playwright-core').Browser} browser
 */
export async function fillForm(browser, url, form, { maxSteps = 40, maxActions = 150 } = {}) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message.slice(0, 200)));
  await page.addInitScript(instrument);
  await page.addInitScript(json => {
    window.__BENCH_FORM__ = JSON.parse(json);
  }, JSON.stringify(form));

  await page.goto(url);
  const formEl = page.locator('#root form');
  await formEl.waitFor({ timeout: 120000 });
  const loadStart = await page.evaluate(() => performance.now());
  await page.evaluate(([start, quiet, timeout]) => window.__bench.settle(start, quiet, timeout), [loadStart, 1000, 60000]);
  const blockedOnLoad = await page.evaluate(() => window.__bench.longTasks.splice(0).reduce((a, b) => a + b, 0));
  await page.evaluate(() => window.__bench.interactions.splice(0));

  // Every change of the QuestionnaireResponse gets a timestamp.
  await page.evaluate(() => {
    const store = window.__referoStore;
    let content = store.getState().refero.form.FormData.Content;
    store.subscribe(() => {
      const next = store.getState().refero.form.FormData.Content;
      if (next !== content) {
        content = next;
        window.__bench.qrChanges.push(performance.now());
      }
    });
  });

  const actions = [];
  const act = async (label, fn) => {
    const before = await page.evaluate(() => window.__bench.qrChanges.length);
    await fn();
    // From when the user is done (last key, click) until the page stops changing, and until the last change of
    // the response.
    const doneAt = await page.evaluate(() => performance.now());
    const pageMs = await page.evaluate(
      ([start, quiet, timeout]) => window.__bench.settle(start, quiet, timeout),
      [doneAt, SETTLE_QUIET_MS, SETTLE_TIMEOUT_MS]
    );
    const qrMs = await page.evaluate(
      ([start, from]) => {
        const changes = window.__bench.qrChanges.slice(from);
        return changes.length ? Math.max(0, changes.at(-1) - start) : null;
      },
      [doneAt, before]
    );
    actions.push({ label, pageMs: Math.round(pageMs), qrMs: qrMs === null ? null : Math.round(qrMs) });
  };

  let stopReason = 'done';
  let steps = 0;
  const done = new Set();
  for (; steps < maxSteps && actions.length < maxActions; steps++) {
    // What is visible on this step, top to bottom, one control at a time; the form re-renders after each answer,
    // so the next control is looked up again every time.
    while (actions.length < maxActions) {
      const control = await formEl.evaluate(
        (root, doneKeys) => {
          const visible = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
          for (const el of root.querySelectorAll('select, input, textarea')) {
            if (el.disabled || el.readOnly || el.type === 'file' || el.type === 'hidden' || !el.id) continue;
            const choice = el.type === 'radio' || el.type === 'checkbox';
            // A slider's range input is hidden; the design system's track next to it is what the user sees.
            const slider = el.type === 'range' ? root.querySelector(`[data-testid="test-slider-${CSS.escape(el.id)}"]`) : null;
            if (!(choice ? el.labels?.[0] && visible(el.labels[0]) : slider ? visible(slider) : visible(el))) continue;
            const key = el.type === 'radio' ? `radio:${el.name}` : `${el.tagName}:${el.type}:${el.id}`;
            if (doneKeys.includes(key)) continue;
            const labelledBy = (el.getAttribute('aria-labelledby') ?? '')
              .split(' ')
              .map(id => document.getElementById(id)?.textContent ?? '');
            return {
              key,
              tag: el.tagName,
              type: el.type,
              id: el.id,
              inputmode: el.getAttribute('inputmode') ?? '',
              placeholder: el.getAttribute('placeholder') ?? '',
              label: (el.labels?.[0]?.textContent ?? labelledBy.join(' ')).trim().slice(0, 60),
            };
          }
          return null;
        },
        [...done]
      );
      if (!control) break;
      done.add(control.key);
      const el = formEl.locator(`[id="${control.id.replace(/"/g, '\\"')}"]`).first();
      if (control.tag === 'SELECT') {
        await act(`select ${control.label || control.id}`, async () => {
          const options = await el.evaluate(node => [...node.options].map(option => option.value).filter(Boolean));
          if (options.length) await el.selectOption(options[0]);
        });
      } else if (control.type === 'radio' || control.type === 'checkbox') {
        await act(`${control.type} ${control.label}`, () => el.evaluate(node => node.labels[0].click()));
      } else if (control.type === 'range') {
        // The design system slider takes the pointer on the wrapper around its track and marker (the marker is the
        // div positioned in px) and reads the value from where the pointer is; the second step is chosen.
        await act(`slider ${control.label || control.id}`, async () => {
          const max = Number((await el.getAttribute('max')) ?? 1);
          const track = formEl.locator(`[data-testid="test-slider-${control.id}"] div[style*="px"]`).first().locator('xpath=..');
          await track.scrollIntoViewIfNeeded();
          const box = await track.boundingBox();
          if (box && max > 0) await page.mouse.click(box.x + box.width / max, box.y + box.height / 2);
        });
      } else if (control.type === 'number' || /decimal|numeric/.test(control.inputmode)) {
        await act(`number ${control.label || control.id}`, async () => {
          await el.click();
          await el.pressSequentially('72', { delay: 40 });
          await el.press('Tab');
        });
      } else if (control.type === 'text' || control.tag === 'TEXTAREA') {
        await act(`text ${control.label || control.id}`, async () => {
          await el.click();
          await el.pressSequentially(textFor(control.label, control.placeholder, control.id), { delay: 40 });
          await el.press('Tab');
        });
      }
    }
    const next = page.locator('#root').getByRole('button', { name: 'Neste' });
    if (!(await next.isVisible().catch(() => false))) break;
    const headingBefore = await formEl
      .locator('h1, h2')
      .first()
      .textContent()
      .catch(() => '');
    await act('Neste', () => next.click());
    const headingAfter = await formEl
      .locator('h1, h2')
      .first()
      .textContent()
      .catch(() => '');
    if (headingAfter === headingBefore) {
      stopReason = `"Neste" did not move on from "${headingBefore?.trim()}"`;
      break;
    }
  }

  const measured = await page.evaluate(() => {
    const { longTasks, interactions, worker } = window.__bench;
    // One interaction (key press, click) can have several entries; the longest is what the user waited.
    const perInteraction = new Map();
    for (const entry of interactions) perInteraction.set(entry.id, Math.max(perInteraction.get(entry.id) ?? 0, entry.ms));
    const text = JSON.stringify(window.__referoStore.getState().refero.form.FormData.Content?.item ?? null);
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193) >>> 0;
    return { longTasks, interactions: [...perInteraction.values()], worker, qrHash: hash.toString(16) };
  });
  await page.close();

  const { longTasks, interactions, worker } = measured;
  return {
    steps,
    stopReason,
    actions: actions.length,
    qrHash: measured.qrHash,
    blockedOnLoadMs: Math.round(blockedOnLoad),
    totalBlockingTimeMs: Math.round(longTasks.reduce((sum, ms) => sum + Math.max(0, ms - 50), 0)),
    longTasks: longTasks.length,
    longestTaskMs: Math.round(Math.max(0, ...longTasks)),
    interactions: { ...stats(interactions), over100ms: interactions.filter(ms => ms > 100).length },
    qrUpdatedMs: stats(actions.map(action => action.qrMs)),
    pageSettledMs: stats(actions.map(action => action.pageMs)),
    worker: {
      created: worker.created,
      posted: worker.posted,
      answered: worker.answered,
      errors: worker.errors,
      terminated: worker.terminated,
      answerMs: stats(worker.answerMs),
    },
    pageErrors: [...new Set(pageErrors)].slice(0, 5),
  };
}
