# Form comparison

Answers the question "does this change alter what refero does with real forms?" by filling in a folder of forms the same way on two versions
of the code and comparing the QuestionnaireResponse after every step.

It is not part of `npm test`: it needs a folder of forms that lives outside the repository, and a full run takes a while.

## Use

```sh
# 1. Record what the code you are working on does
npm run test:forms -- record --label working --forms C:/code/nhn/Skjemadefinisjoner/Produksjon

# 2. Record what another version does (any commit, branch or tag)
npm run test:forms -- record --label head --ref HEAD --forms C:/code/nhn/Skjemadefinisjoner/Produksjon

# 3. Compare
npm run test:forms -- compare head working
```

Pick the ref with care. `HEAD` is the branch without the uncommitted changes. To compare a branch with where it started, use the merge base
(`git merge-base HEAD origin/master`); a local `master` that has not been pulled brings every commit since into the comparison.

A recording takes as long as the code is slow: the forms are shared between several processes (`--jobs`), every form prints a line when it
is done, and `--filter` and `--only-expressions` make it shorter.

`compare` lists, for every form that differs, the first step where the two part ways, the edit that was made and the items whose answers
differ. It also shows the time each side spent, per form. The exit code is 1 when there are differences.

Set `REFERO_FORMS_DIR` to leave out `--forms`.

| Option               | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `--label <name>`     | Name of the recording, `results/<name>.json`                                |
| `--ref <git ref>`    | Record that version instead of the working tree                             |
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

- Nothing is rendered: components, validation and what the user sees are not compared.
- The web worker: under vitest there is no `Worker`, so the calculations run on the main thread path.
- Attachments, and choices whose options are not codings or come from an external value set, are not answered.
- Forms that only make sense with prefilled data get whatever the scenario happens to give them.
- If the two versions do not have the same dependencies, the borrowed `node_modules` is wrong for the ref.

## Files

- `scenario.ts` - decides the edits. Uses nothing from `src`, so both versions are asked to do the same.
- `record.forms.ts` - drives the store and writes the recording. Its imports from `src` are the only things that must exist on every version
  that is compared.
- `run.mjs` - the command line: `record` and `compare`.
- `results/` - the recordings; not checked in.
