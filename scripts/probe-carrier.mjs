import { chromium } from '@playwright/test';
import fs from 'fs';

const login = JSON.parse(fs.readFileSync('fixtures/login.json', 'utf8'));
const job = JSON.parse(fs.readFileSync('fixtures/job.json', 'utf8'));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.context().clearCookies();
await page.goto(login.url);
await page.locator(login.selectors.email).fill(login.username2);
await page.locator(login.selectors.password).fill(login.password2);
await page.click('#btn-login');
await page.waitForURL((u) => u.pathname.includes('/jobs'));

const createJob = async () => {
  await page.locator('a.nav-link.btn-green').filter({ hasText: /add job/i }).click();
  const form = page.locator('#job-setting-form');
  await form.locator('#job_name').fill(`Job-carrier-${Date.now()}`);
  await form.locator('#job_type').selectOption({ label: job.jobTypeValue });
  await form.locator('#adddestinationid').selectOption(job.destinationValue);
  await form.locator('#district_id').selectOption(job.districtValue);
  await form.locator('#group_id').selectOption(job.crewValue);
  await form.locator('select[name="basin_id"]').selectOption({ label: job.basinValue });
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  await form.locator('#addstartdate').fill(fmt(today));
  await form.locator('#addenddate').fill(fmt(tomorrow));
  const next = form.locator('#job-setting-btn');
  await next.click();
  await page.waitForFunction(() => !document.querySelector('#job-setting-btn')?.innerText?.match(/sending/i), null, { timeout: 120000 });
  await page.waitForTimeout(3000);
};

await createJob();

const jobModal = page.getByRole('dialog');
const operatorBox = jobModal.locator('div.ratesheet-list-box').first();
await operatorBox.waitFor({ state: 'visible', timeout: 120000 });
await operatorBox.locator('div.col-md-2 > button.btn.btn-green').filter({ visible: true }).first().click();
await page.waitForTimeout(3000);
await operatorBox.locator('select[name="operator_equipment_basin_id[]"]').filter({ visible: true }).first().selectOption({ label: job.rateSheetValue });
await page.waitForTimeout(3000);
const company = jobModal.locator('#addologisticid').filter({ visible: true }).first();
if (await company.isVisible().catch(() => false)) {
  await company.selectOption({ label: job.companyValue });
  await page.waitForTimeout(3000);
  const confirm = jobModal.getByRole('button', { name: /^confirm$/i }).filter({ visible: true }).first();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await page.waitForTimeout(3000);
}
await jobModal.locator('div.col-md-4 > button.btn.btn-green').filter({ visible: true }).first().click();
await page.waitForTimeout(3000);
const companyGrid = jobModal.getByRole('grid').nth(1);
await companyGrid.getByRole('combobox').first().selectOption({ label: job.rateSheetValue });
await page.waitForTimeout(3000);
await jobModal.locator('#job-role-btn').filter({ visible: true }).first().click();
await page.waitForTimeout(5000);
await jobModal.locator('#job-demurrage-btn').filter({ visible: true }).first().click();
await page.waitForTimeout(5000);

const product = jobModal.locator('#addpoproducts').filter({ visible: true }).first();
await product.selectOption({ label: job.productValue });
await page.waitForTimeout(2000);
await jobModal.locator('#unit_code').filter({ visible: true }).first().selectOption({ label: job.unitCodeValue });
await jobModal.locator('#unitweight').filter({ visible: true }).first().fill(job.padDesignValue);
await jobModal.locator('#addpomasterid').filter({ visible: true }).first().selectOption({ label: job.poValue });
await jobModal.locator('div.modal-body > table.table.table-xs > tbody > tr > td > div.fielddata > input.form-control.poprefill').filter({ visible: true }).first().fill(job.preFillVolumeValue);
await jobModal.locator('div.modal-body > table.table.table-xs > tbody > tr > td > div.fielddata > div.clonemorequantity > input.form-control.requiredfiled').filter({ visible: true }).first().fill(job.poAllocationValue);
await jobModal.locator('table.table.table-xs tbody tr td:nth-child(9) input.form-control').filter({ visible: true }).first().fill(job.avgLoadWeightValue);
await jobModal.locator('#job-products-submit-btn').filter({ visible: true }).first().click();
await page.waitForTimeout(5000);

const carrierSelects = jobModal.locator('#carrierlist');
const count = await carrierSelects.count();
console.log('carrierlist count:', count);

for (let i = 0; i < count; i++) {
  const sel = carrierSelects.nth(i);
  const visible = await sel.isVisible();
  const options = await sel.evaluate((el) =>
    [...el.options].map((o) => ({ value: o.value, label: o.label, text: o.text }))
  );
  console.log(`#carrierlist[${i}] visible=${visible}`, JSON.stringify(options, null, 2));
}

const carrier = jobModal.locator('#carrierlist').filter({ visible: true }).first();
try {
  await carrier.selectOption({ label: job.carrierValue });
  console.log('selectOption by label succeeded');
} catch (e) {
  console.log('selectOption by label failed:', e.message?.slice(0, 200));
  try {
    await carrier.selectOption({ label: new RegExp(job.carrierValue, 'i') });
    console.log('selectOption by regex succeeded');
  } catch (e2) {
    console.log('selectOption by regex failed:', e2.message?.slice(0, 200));
  }
}

const selected = await carrier.evaluate((el) => ({
  value: el.value,
  selectedText: el.options[el.selectedIndex]?.text,
}));
console.log('after select:', selected);

const equipment = jobModal.locator('#equipment_id').filter({ visible: true }).first();
const eqOptions = await equipment.evaluate((el) =>
  [...el.options].map((o) => ({ value: o.value, label: o.label, text: o.text }))
);
console.log('#equipment_id options:', JSON.stringify(eqOptions, null, 2));

await browser.close();
