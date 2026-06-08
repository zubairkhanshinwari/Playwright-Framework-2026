---
name: px-playwright-framework
description: >-
  Px-regression Playwright framework: one login, three files per test case
  (json + page + spec), login in spec, random data in page object, async flow
  methods only. Use when adding or changing tests, page objects, fixtures, or
  Playwright automation in Px-regression. Always follow this architecture; do not
  add extra files per feature.
---

# Px-regression Playwright Framework

## Mandatory architecture

Every **new test case / feature** uses **exactly three files**. Do not create other files for that feature (no `fixtures/index.ts`, no extra helpers, no duplicate login files).

| # | File | Location | Purpose |
|---|------|----------|---------|
| 1 | `{feature}.json` | `fixtures/` | URLs, menu labels, selectors, dropdown values, form/modal scope keys |
| 2 | `create{Feature}Page.ts` | `pages/` | Page object: `async` methods, random test data, all UI flow |
| 3 | `create{Feature}.spec.ts` | `tests/` | Test: **login only** + call page methods (no locators, no random data) |

**Examples:**

| Feature | JSON | Page | Spec |
|---------|------|------|------|
| Terminal | `createterminal.json` | `createterminalpage.ts` | `createterminal.spec.ts` |
| Job | `job.json` | `createJobPage.ts` | `createJob.spec.ts` |

Use **TypeScript** (`.ts`), not `.js`, unless the user explicitly asks otherwise.

---

## Layer responsibilities

| Layer | Owns | Must NOT own |
|-------|------|----------------|
| **Spec** | `test.setTimeout`, `LoginPage` + `login()` or `login2()`, construct feature page, call `async` methods in order | Locators, selectors, random names/emails, `page.locator`, expects for UI |
| **Page** | Flow steps, `expect` where needed, random data (`Job-${Date.now()}`, `Terminal-${timestamp}`), modal/form scope, screenshots | Login (never call `LoginPage` from page) |
| **JSON** | URLs, button labels, selector strings, static dropdown values | Logic |

---

## Shared login (one place only)

| File | Role |
|------|------|
| `fixtures/login.json` | `url`, `dashboardUrl`, `username`/`password`, `username2`/`password2`, `selectors` |
| `pages/login.page.ts` | `LoginPage` with `async login()` and `async login2()` |

### Which login to use

| Method | User | After login |
|--------|------|-------------|
| `login()` | Admin (`username` / `password`) | Navigates to `/admin/dashboard` |
| `login2()` | Company (`username2` / `password2`) | Lands on `/jobs` (do **not** force admin dashboard) |

**Every spec** must call login at the start — never inside the feature page object:

```ts
const loginPage = new LoginPage(page, loginData);
await loginPage.login();   // admin flows (e.g. terminal)
// or
await loginPage.login2();  // company flows (e.g. job)
```

**Different user?** Only update `fixtures/login.json` and `LoginPage` if needed. Do **not** create `login2.json` or a second login page per feature.

---

## Random / dynamic test data

Generate **inside the page object**, not in the spec.

**Single step (job name):**

```ts
async createJobSettings() {
  const randomJobName = `Job-${Date.now()}`;
  // use randomJobName in fill + expect
}
```

**Multi-step (create then search):** store on the class when a later method needs the same value:

```ts
private randomTerminalName = '';

async createTerminal() {
  const timestamp = Date.now();
  const randomTerminalName = `Terminal-${timestamp}`;
  const randomEmail = `terminal.${timestamp}@example.com`;
  this.randomTerminalName = randomTerminalName;
  // fill fields...
}

async searchTerminal() {
  const terminalName = this.randomTerminalName;
  // search using terminalName
}
```

Use one `Date.now()` per pair (name + email) so values stay in sync.

---

## `fixtures/{feature}.json`

- URLs (`terminalUrl`, `jobsUrl`), menu labels, button text, selectors, static dropdown values.
- **Form/modal scope** when IDs repeat on the page (e.g. `jobFormSelector`: `#job-setting-form`, `popupSelector`: `#add_terminals`).
- Page object reads via `this.data` — **no hardcoded IDs in spec**; avoid duplicating IDs in page when they belong in json.

---

## `pages/create{Feature}Page.ts`

```ts
import { expect, type Locator, type Page } from '@playwright/test';
import featureData from '../fixtures/{feature}.json';

export class Create{Feature}Page {
  private randomTerminalName = ''; // only if a later method needs it

  constructor(
    private readonly page: Page,
    private readonly data: typeof featureData
  ) {}

  async openSomePopup() { /* navigation from json menu/url */ }

  async createSomething() {
    const { selectors, popupSelector, jobFormSelector } = this.data;
    const modal = this.page.locator(popupSelector);
    const form = this.page.locator(jobFormSelector);
    // random data + fills + expects here
  }
}
```

### Rules

- One **async method per user flow step** (e.g. `openAddTerminalPopup`, `createTerminal`, `searchTerminal`, `openAddJobForm`, `createJobSettings`).
- **No login** in page class.
- **Scope locators** to modal or form to avoid strict-mode duplicates:

```ts
const form = this.page.locator(jobFormSelector);
const crew = form.locator(selectors.crew);
```

### Dropdown / select pattern (match terminal + job)

```ts
const unit = modal.locator(selectors.unit);
await unit.scrollIntoViewIfNeeded();
await unit.selectOption(unitValue);
await this.page.waitForTimeout(3000);
```

Use `{ label: 'Bulk / Pneumatic' }` when the visible label differs from the option value. Wait between dependent dropdowns so options can load (job type → destination → district → crew → basin).

### Date fields (when needed)

Private helpers in the page class are fine:

```ts
private async selectDate(form: Locator, selector: string, date: Date) { /* fill MM/DD/YYYY */ }
private formatDate(date: Date) { /* return MM/DD/YYYY */ }
```

### Documentation (user rule)

On new or changed methods, add:

```ts
/**
 * @defination Short description of what the method does
 * @createdon YYYY-MM-DD
 * @Author Sial
 */
```

---

## `tests/create{Feature}.spec.ts`

### Admin + terminal (reference)

```ts
import { test } from '@playwright/test';
import loginData from '../fixtures/login.json';
import createTerminalData from '../fixtures/createterminal.json';
import { LoginPage } from '../pages/login.page';
import { CreateTerminalPage } from '../pages/createterminalpage';

test('create terminal successfully', async ({ page }) => {
  test.setTimeout(180000);

  const loginPage = new LoginPage(page, loginData);
  await loginPage.login();

  const createTerminalPage = new CreateTerminalPage(page, createTerminalData);
  await createTerminalPage.openAddTerminalPopup();
  await createTerminalPage.createTerminal();
  await createTerminalPage.searchTerminal();
});
```

### Company + job (reference)

```ts
import { test } from '@playwright/test';
import loginData from '../fixtures/login.json';
import jobData from '../fixtures/job.json';
import { LoginPage } from '../pages/login.page';
import { CreateJobPage } from '../pages/createJobPage';

test('create job settings', async ({ page }) => {
  test.setTimeout(180000);

  const loginPage = new LoginPage(page, loginData);
  await loginPage.login2();

  const createJobPage = new CreateJobPage(page, jobData);
  await createJobPage.createJobSettings();
});
```

### Spec rules

- **Thin spec:** login → construct page → call methods (no parameters for random data).
- **No** inline `page.locator(...)` for feature flows.
- **No** `const randomX = ...` in spec — that belongs in the page object.
- **No** new files beyond the three-file set for that feature.
- Default `test.setTimeout(180000)` for long PropX flows.

---

## Existing project files (do not duplicate)

Reuse — **do not recreate per test**:

- `playwright.config.ts`, `tsconfig.json`, `package.json`
- `pages/login.page.ts`, `fixtures/login.json`
- `screenshots/` (e.g. `screenshots/step-name.png` when used)
- `.cursor/mcp.json`, agents (optional)

---

## When user asks for a new test case

1. Create **only** `fixtures/{name}.json`, `pages/create{Name}Page.ts`, `tests/create{Name}.spec.ts`.
2. Spec: `login()` or `login2()` → page method chain.
3. Put IDs/values in json; random names in page; empty `async` stubs until user gives steps.
4. **Do not** add `index.ts`, shared fixture wrappers, or duplicate login.
5. Run `npx playwright test tests/create{Name}.spec.ts --workers=1` after implementation.

---

## Anti-patterns (never do for a new feature)

| Anti-pattern | Why |
|--------------|-----|
| `fixtures/index.ts` or custom base fixture | Breaks 3-file rule |
| Second login json/page per feature | Use `login.json` + `login()` / `login2()` |
| `await loginPage.login2()` inside page object | Login stays in spec only |
| `const randomJobName = ...` in spec | Random data stays in page |
| All flow logic in `.spec.ts` | Use page `async` methods |
| `helpers.ts` / `utils.ts` per feature | Extra file beyond three |
| `getByRole('button', { name: 'Add job' })` without checking UI | Company jobs use `a.nav-link.btn-green` + `/add job/i` |
| `login2()` then `goto('/admin/dashboard')` | Company user belongs on `/jobs` |

---

## Reference implementation (copy this layout)

| Flow | Spec login | Page highlights | JSON highlights |
|------|------------|-----------------|-----------------|
| **Terminal** | `login()` | `openAddTerminalPopup` → `createTerminal()` (random name/email) → `searchTerminal()` | `terminalUrl`, `menu`, `popupSelector`, `selectors` |
| **Job** | `login2()` | `openAddJobForm()` → `createJobSettings()` (random job name, form scope, dates) | `jobsUrl`, `jobFormSelector`, `addJobLink`, dropdown values |

Files:

- `tests/createterminal.spec.ts` + `pages/createterminalpage.ts` + `fixtures/createterminal.json`
- `tests/createJob.spec.ts` + `pages/createJobPage.ts` + `fixtures/job.json`
