# Form comparison

Answers the question "does this change alter what refero does with real forms?" by filling in a folder of forms the same way on two versions
of the code and comparing the QuestionnaireResponse after every step.

It is not part of `npm test`: a full run takes a while.

The forms are the Questionnaire and Bundle json files in `test/form-comparison/forms/`, in any folder structure. Checked in is the newest
version of each production form that has calculated or copy expressions, unchanged. Add a form by copying its file there.

## Use

```sh
# 1. Record what the code you are working on does
npm run test:forms -- record --label working

# 2. Record what another version does (any commit, branch or tag)
npm run test:forms -- record --label head --ref HEAD

# 3. Compare
npm run test:forms -- compare head working
```

Pick the ref with care. `HEAD` is the branch without the uncommitted changes. To compare a branch with where it started, use the merge base
(`git merge-base HEAD origin/master`); a local `master` that has not been pulled brings every commit since into the comparison.

A recording takes as long as the code is slow: the forms are shared between several processes (`--jobs`), every form prints a line when it
is done, and `--filter` and `--only-expressions` make it shorter.

`compare` lists, for every form that differs, the first step where the two part ways, the edit that was made and the items whose answers
differ. It also shows the time each side spent, per form. The exit code is 1 when there are differences.

To use another folder of forms, give `--forms <folder>` or set `REFERO_FORMS_DIR`.

| Option               | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `--label <name>`     | Name of the recording, `results/<name>.json`                                |
| `--ref <git ref>`    | Record that version instead of the working tree                             |
| `--forms <folder>`   | Another folder of forms than `test/form-comparison/forms/`                  |
| `--filter <text>`    | Only files whose path contains the text, for example `2026/` or a form name |
| `--seeds 1,2,3`      | One run per seed; each seed fills the form in differently (default `1`)     |
| `--steps <n>`        | Edits per run (default 25)                                                  |
| `--jobs <n>`         | Processes to share the forms between (default half the cores, at most 8)    |
| `--only-expressions` | Only forms with calculated or copy expressions                              |
| `--all-languages`    | Every Questionnaire in a Bundle, not only the first                         |
| `--dump`             | Keep the whole response after every step; use with `--filter`               |

To look closer at a difference, record both sides again with `--filter <form> --dump` and diff the `response` of the step in the two files
under `results/`.

## What it does

For every form, with the legacy calculation options and with the corrected ones:

1. Loads the questionnaire into refero's store (`setSkjemaDefinitionAction`).
2. Makes a fixed sequence of edits, chosen by a seeded random generator: answers a question, clears one, adds or removes a repeated item, or
   gives an answer another part of the form is waiting for (enableWhen). Halfway through it answers every question in the form.
3. Dispatches each edit with the actions the form components use, followed by `runCalculatorsAction` and `runEnableWhenAction`, as
   `useOnAnswerChange` does, and lets the debounced calculations finish.
4. Stores a hash of the answers of every item, and of the whole response.

So it covers what decides the response: the reducers, enableWhen, scoring and the FHIRPath calculations. The clock is fixed, so `today()`
and `now()` give the same on both sides.

`--ref` checks the version out in a temporary git worktree, lends it this checkout's `node_modules`, copies this folder into it and runs the
same recorder there. Both sides are therefore driven by the same recorder, and the worktree is removed afterwards.

## What it does not cover

- Nothing is rendered: components, validation and what the user sees are not compared. The browser recording below covers that.
- The web worker: under vitest there is no `Worker`, so the calculations run on the main thread path.
- Attachments, and choices whose options are not codings or come from an external value set, are not answered.
- Forms that only make sense with prefilled data get whatever the scenario happens to give them.
- If the two versions do not have the same dependencies, the borrowed `node_modules` is wrong for the ref.

## In a browser: what the user experiences

The recording above says whether the response is the same. `browser` says how the page behaves for the user while the form is filled in: how
long input is blocked, and how long it takes before the response, with its calculations, is updated.

```sh
# The version before a change and the working tree, three runs per form
npm run test:forms -- browser --label before --ref <git ref> --runs 3
npm run test:forms -- browser --label after --runs 3

npm run test:forms -- compare-browser before after
```

`browser` builds the page in `browser/` for production and serves it: refero with nothing else around it. Dev mode is never measured:
React's development build makes the page several times slower than what users get, and it makes a slow page look like a refero problem. It
then fills in every form in Chrome the way a user does: picks the first option in drop-downs and radio groups (often "Ja", which shows the
follow-up questions), ticks checkboxes, sets sliders, types in text, number and date fields, and presses "Neste" through a step form. The
choices are the same every run. A form stops early when "Neste" does not move on, for example because of a field the filler does not answer;
the log says so.

For every form it records:

| Measure              | What it is                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| input blocked        | Total blocking time: the part of each long task (over 50 ms) on the main thread above 50 ms. The user cannot type or click meanwhile |
| longest block        | The longest of those tasks                                                                                                           |
| interaction p90      | Event Timing: time from a click or key press until the screen shows it (what INP is built on)                                        |
| response updated p90 | Time from the end of an action until the last change of the QuestionnaireResponse, so calculations included                          |
| blocked on load      | Long tasks while the form loads                                                                                                      |
| worker               | Requests to the FHIRPath web worker, answers, errors, and whether refero fell back to the main thread                                |
| final response       | A hash of the response when the form is done; both versions should end up with the same                                              |

`compare-browser` shows the median per form of each measure, the totals, and problems: a final response that differs, or a worker that
failed. The exit code is 1 when there are problems.

`--filter`, `--forms` and `--ref` work as for `record`. Other options: `--runs <n>` (default 1; use 3 or more to compare, the timings vary
from run to run), `--max-actions <n>` (default 150), `--headed` to watch the browser.

It uses Playwright's own Chromium when it is installed (`npx playwright-core install chromium`), otherwise the installed Chrome;
`BROWSER_BENCH_CHROME=<path>` picks another. The numbers depend on the machine and on what else runs on it: compare two recordings made on
the same machine, one right after the other.

## Files

- `scenario.ts` - decides the edits. Uses nothing from `src`, so both versions are asked to do the same.
- `record.forms.ts` - drives the store and writes the recording. Its imports from `src` are the only things that must exist on every version
  that is compared.
- `browser/index.html`, `browser/main.tsx`, `browser/vite.config.ts` - the page the browser recording fills in: the smallest page that shows
  refero, built for production. `main.tsx` imports `@/components/index` and `@/reducers`, which must exist on every version that is
  compared.
- `browser/fill.mjs` - fills in one form in the browser and measures.
- `run.mjs` - the command line: `record`, `compare`, `browser` and `compare-browser`.
- `results/` - the recordings; not checked in.
