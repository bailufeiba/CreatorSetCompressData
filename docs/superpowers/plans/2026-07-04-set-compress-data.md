# SetCompressData Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure Node.js CLI that recursively sets or removes `userData.compressSettings.useCompressTexture` for `.png.meta` files.

**Architecture:** Keep the utility in one script, `SetCompressData.js`, because the project is a single-purpose command line tool. Add a small Node test runner at `TEST/run-tests.js` that creates temporary fixtures, executes the CLI, and asserts file contents and output.

**Tech Stack:** Node.js built-in `fs`, `path`, `os`, `child_process`, and `assert`.

---

### Task 1: CLI Behavior Tests

**Files:**
- Create: `TEST/run-tests.js`
- Modify: `SetCompressData.js`

- [ ] **Step 1: Write failing tests**

Create `TEST/run-tests.js` with tests that:

- Run `node SetCompressData.js <targetDir> true <ignoreJsonPath>`.
- Confirm root-level ignored files are skipped.
- Confirm nested relative-path ignored files are skipped.
- Confirm non-ignored `.png.meta` files receive `compressSettings`.
- Run `node SetCompressData.js <targetDir> false <ignoreJsonPath>`.
- Confirm non-ignored files remove `compressSettings`.
- Confirm ignored file absolute paths are printed.

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
node TEST/run-tests.js
```

Expected: failure because `SetCompressData.js` is empty and does not mutate fixture files.

- [ ] **Step 3: Implement CLI**

Implement argument parsing, recursive scanning, ignore JSON parsing, relative path normalization, JSON mutation, summary printing, and non-zero exit on errors in `SetCompressData.js`.

- [ ] **Step 4: Run tests and verify pass**

Run:

```bash
node TEST/run-tests.js
```

Expected: all tests pass and the command output includes `======All Completed======`.

### Task 2: Manual Usage Check

**Files:**
- Modify: `SetCompressData.js`

- [ ] **Step 1: Check missing argument output**

Run:

```bash
node SetCompressData.js
```

Expected: usage text is printed and process exits non-zero.

- [ ] **Step 2: Check invalid boolean output**

Run:

```bash
node SetCompressData.js . maybe
```

Expected: an error explains the second argument must be `true` or `false`.
