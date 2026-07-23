import { expect, type Locator, type Page } from '@playwright/test';
import jobData from '../fixtures/job.json';

export class CreateJobPage {
  constructor(
    private readonly page: Page,
    private readonly data: typeof jobData
  ) {}

  /** Add Job wizard modal. */
  private jobModal() {
    return this.page.getByRole('dialog');
  }

  /** Visible control only (wizard repeats same ids on hidden steps). */
  private modalField(selector: string) {
    return this.jobModal().locator(selector).filter({ visible: true }).first();
  }

  
  private async modalWait(ms = 3000) {
    await this.page.waitForTimeout(ms);
  }

  async openAddJobForm() {
    const { selectors } = this.data;
    const addJob = this.page.locator(selectors.addJobLink).filter({ hasText: /add job/i });
    await expect(addJob).toBeVisible({ timeout: 30000 });
    await addJob.click();
    await expect(this.page.locator(this.data.jobFormSelector).locator(selectors.jobName)).toBeVisible({
      timeout: 30000,
    });
  }

 
  async createJobSettings() {
    const { jobFormSelector, selectors, jobTypeValue, destinationValue, districtValue, crewValue, basinValue } =
      this.data;

    const randomJobName = `Job-${Date.now()}`;

    await this.openAddJobForm();

    const form = this.page.locator(jobFormSelector);

    const jobNameInput = form.locator(selectors.jobName);
    await jobNameInput.fill(randomJobName);
    await expect(jobNameInput).toHaveValue(randomJobName);

    const jobType = form.locator(selectors.jobType);
    await jobType.scrollIntoViewIfNeeded();
    await jobType.selectOption({ label: jobTypeValue });
    await this.modalWait();

    const destination = form.locator(selectors.destination);
    await destination.scrollIntoViewIfNeeded();
    await destination.selectOption(destinationValue);
    await this.modalWait();

    const district = form.locator(selectors.district);
    await district.scrollIntoViewIfNeeded();
    await district.selectOption(districtValue);
    await this.modalWait();

    const crew = form.locator(selectors.crew);
    await crew.scrollIntoViewIfNeeded();
    await crew.selectOption(crewValue);
    await this.modalWait();

    const basin = form.locator(selectors.basin);
    await basin.scrollIntoViewIfNeeded();
    await basin.selectOption({ label: basinValue });
    await this.modalWait();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await this.selectDate(form, selectors.startDate, today);
    await this.selectDate(form, selectors.endDate, tomorrow);

    const nextButton = form.locator(selectors.nextButton);
    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();
    page.getbytestid
    await expect(nextButton).not.toContainText(/sending/i, { timeout: 120000 });
    await expect(this.jobModal().locator(this.data.rateSheetListSelector).first()).toBeVisible({
      timeout: 120000,
    });
    await this.modalWait();
  }


  async roleSetup() {
    const { selectors, rateSheetListSelector, rateSheetValue, companyValue } = this.data;
    const jobModal = this.jobModal();

    const operatorBox = jobModal.locator(rateSheetListSelector).first();

    const addRateSheetFirst = operatorBox.locator(selectors.addRateSheetButton).filter({ visible: true }).first();
    await addRateSheetFirst.scrollIntoViewIfNeeded();
    await addRateSheetFirst.click();
    await this.modalWait();

    const rateSheetFirst = operatorBox.locator(selectors.rateSheetSelect).filter({ visible: true }).first();
    await expect(rateSheetFirst).toBeVisible({ timeout: 30000 });
    await rateSheetFirst.scrollIntoViewIfNeeded();
    await rateSheetFirst.selectOption({ label: rateSheetValue });
    await this.modalWait();

    const company = jobModal.locator(selectors.companySelect).filter({ visible: true }).first();
    if (await company.isVisible().catch(() => false)) {
      await company.scrollIntoViewIfNeeded();
      await company.selectOption({ label: companyValue });
      await this.modalWait();
      const confirmBtn = jobModal.getByRole('button', { name: /^confirm$/i }).filter({ visible: true }).first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await this.modalWait();
      }
    }

    const addSheet = jobModal.locator(selectors.addSheetButton).filter({ visible: true }).first();
    await expect(addSheet).toBeVisible({ timeout: 30000 });
    await addSheet.scrollIntoViewIfNeeded();
    await addSheet.click();
    await this.modalWait();

    const companyGrid = jobModal.getByRole('grid').nth(1);
    const rateSheetSecond = companyGrid.getByRole('combobox').first();
    await expect(rateSheetSecond).toBeVisible({ timeout: 30000 });
    await rateSheetSecond.scrollIntoViewIfNeeded();
    await rateSheetSecond.selectOption({ label: rateSheetValue });
    await this.modalWait();

    const roleNext = this.modalField(selectors.roleNextButton);
    await roleNext.scrollIntoViewIfNeeded();
    await roleNext.click();
    await expect(roleNext).not.toContainText(/sending/i, { timeout: 120000 });
    await expect(jobModal).toBeVisible({ timeout: 120000 });
    await expect(this.modalField(selectors.demurrageNextButton)).toBeVisible({ timeout: 120000 });
    await this.modalWait();
  }


  async demurrageSetup() {
    const { selectors } = this.data;
    const jobModal = this.page.getByRole('dialog');

    const demurrageNext = jobModal.locator(selectors.demurrageNextButton).filter({ visible: true }).first();
    await expect(demurrageNext).toBeVisible({ timeout: 120000 });
    await demurrageNext.scrollIntoViewIfNeeded();
    await demurrageNext.click();

    const product = jobModal.locator(selectors.productSelect).filter({ visible: true }).first();
    await expect(product).toBeVisible({ timeout: 120000 });
    await this.modalWait();
  }

  
  async productSetup() {
    const {
      selectors,
      productValue,
      unitCodeValue,
      padDesignValue,
      poValue,
      preFillVolumeValue,
      poAllocationValue,
      avgLoadWeightValue,
    } = this.data;
    const jobModal = this.page.getByRole('dialog');

    const product = jobModal.locator(selectors.productSelect).filter({ visible: true }).first();
    await expect(product).toBeVisible({ timeout: 120000 });
    await product.scrollIntoViewIfNeeded();
    await product.selectOption({ label: productValue });
    await this.modalWait();

    const unitCode = jobModal.locator(selectors.unitCodeSelect).filter({ visible: true }).first();
    await unitCode.scrollIntoViewIfNeeded();
    await unitCode.selectOption({ label: unitCodeValue });
    await this.modalWait();

    const padDesign = jobModal.locator(selectors.padDesignInput).filter({ visible: true }).first();
    await padDesign.scrollIntoViewIfNeeded();
    await padDesign.fill(padDesignValue);
    await expect(padDesign).toHaveValue(padDesignValue);
    await this.modalWait();

    const po = jobModal.locator(selectors.poSelect).filter({ visible: true }).first();
    await po.scrollIntoViewIfNeeded();
    await po.selectOption({ label: poValue });
    await this.modalWait();

    const preFillVolume = jobModal.locator(selectors.preFillVolumeInput).filter({ visible: true }).first();
    await preFillVolume.scrollIntoViewIfNeeded();
    await preFillVolume.fill(preFillVolumeValue);
    await expect(preFillVolume).toHaveValue(preFillVolumeValue);
    await this.modalWait();

    const poAllocation = jobModal.locator(selectors.poAllocationInput).filter({ visible: true }).first();
    await poAllocation.scrollIntoViewIfNeeded();
    await poAllocation.fill(poAllocationValue);
    await expect(poAllocation).toHaveValue(poAllocationValue);
    await this.modalWait();

    const avgLoadWeight = jobModal.locator(selectors.avgLoadWeightInput).filter({ visible: true }).first();
    await avgLoadWeight.scrollIntoViewIfNeeded();
    await avgLoadWeight.fill(avgLoadWeightValue);
    await expect(avgLoadWeight).toHaveValue(avgLoadWeightValue);
    await this.modalWait();

    const productNext = jobModal.locator(selectors.productNextButton).filter({ visible: true }).first();
    await productNext.scrollIntoViewIfNeeded();
    await productNext.click();
    await expect(productNext).not.toContainText(/sending/i, { timeout: 120000 });

    await expect(jobModal.locator('#pocarrierstable').locator(selectors.carrierSelect).filter({ visible: true }).first()).toBeVisible({
      timeout: 120000,
    });
    await this.modalWait();
  }

 
  async carrierSetup() {
    const { selectors, carrierValue, haulingCostValue } = this.data;
    const jobModal = this.jobModal();
    const carrierTable = jobModal.locator('#pocarrierstable');

    const carrier = carrierTable.locator(selectors.carrierSelect).filter({ visible: true }).first();
    await expect(carrier).toBeVisible({ timeout: 120000 });
    await carrier.scrollIntoViewIfNeeded();
    await carrier.selectOption({ label: carrierValue });
    await this.modalWait();

    const haulingCost = carrierTable.locator(selectors.haulingCostSelect).filter({ visible: true }).first();
    await expect(haulingCost).toBeVisible({ timeout: 30000 });
    await haulingCost.scrollIntoViewIfNeeded();
    await haulingCost.selectOption({ label: haulingCostValue });
    await this.modalWait();

    const carrierNext = jobModal.locator(selectors.carrierNextButton).filter({ visible: true }).first();
    await carrierNext.scrollIntoViewIfNeeded();
    await carrierNext.click();
    await expect(carrierNext).not.toContainText(/sending/i, { timeout: 120000 });

    const permissionsNext = jobModal.locator(selectors.permissionsNextButton).filter({ visible: true }).first();
    await expect(permissionsNext).toBeVisible({ timeout: 120000 });
    await this.modalWait();
  }


  async permissionsSetup() {
    const { selectors } = this.data;
    const jobModal = this.jobModal();

    const permissionsNext = jobModal.locator(selectors.permissionsNextButton).filter({ visible: true }).first();
    await expect(permissionsNext).toBeVisible({ timeout: 120000 });
    await permissionsNext.scrollIntoViewIfNeeded();
    await permissionsNext.click();

    await expect(jobModal.locator(selectors.approvedMileageInput).filter({ visible: true }).first()).toBeVisible({
      timeout: 120000,
    });
    await this.modalWait();
  }

 
  async terminalSetup() {
    const {
      selectors,
      approvedMileageValue,
      approvedLoadTimeValue,
      approvedUnloadTimeValue,
      approvedTransitTimeValue,
    } = this.data;
    const jobModal = this.jobModal();

    const approvedMileage = jobModal.locator(selectors.approvedMileageInput).filter({ visible: true }).first();
    await expect(approvedMileage).toBeVisible({ timeout: 120000 });
    await approvedMileage.scrollIntoViewIfNeeded();
    await approvedMileage.fill(approvedMileageValue);
    await expect(approvedMileage).toHaveValue(approvedMileageValue);
    await this.modalWait();

    const approvedLoadTime = jobModal.locator(selectors.approvedLoadTimeInput).filter({ visible: true }).first();
    await approvedLoadTime.scrollIntoViewIfNeeded();
    await approvedLoadTime.fill(approvedLoadTimeValue);
    await expect(approvedLoadTime).toHaveValue(approvedLoadTimeValue);
    await this.modalWait();

    const approvedUnloadTime = jobModal.locator(selectors.approvedUnloadTimeInput).filter({ visible: true }).first();
    await approvedUnloadTime.scrollIntoViewIfNeeded();
    await approvedUnloadTime.fill(approvedUnloadTimeValue);
    await expect(approvedUnloadTime).toHaveValue(approvedUnloadTimeValue);
    await this.modalWait();

    const approvedTransitTime = jobModal.locator(selectors.approvedTransitTimeInput).filter({ visible: true }).first();
    await approvedTransitTime.scrollIntoViewIfNeeded();
    await approvedTransitTime.fill(approvedTransitTimeValue);
    await expect(approvedTransitTime).toHaveValue(approvedTransitTimeValue);
    await this.modalWait();

    const terminalNext = jobModal.locator(selectors.terminalNextButton).filter({ visible: true }).first();
    await terminalNext.scrollIntoViewIfNeeded();
    await terminalNext.click();
    await expect(terminalNext).not.toContainText(/sending/i, { timeout: 120000 });

    const notesNext = jobModal.locator(selectors.notesNextButton).filter({ visible: true }).first();
    await expect(notesNext).toBeVisible({ timeout: 120000 });
    await this.modalWait();
  }

 
  async notesSetup() {
    const { selectors } = this.data;
    const jobModal = this.jobModal();

    const notesNext = jobModal.locator(selectors.notesNextButton).filter({ visible: true }).first();
    await expect(notesNext).toBeVisible({ timeout: 120000 });
    await notesNext.scrollIntoViewIfNeeded();
    await notesNext.click();

    const saveJob = jobModal.locator(selectors.saveJobButton).filter({ visible: true }).first();
    await expect(saveJob).toBeVisible({ timeout: 120000 });
    await this.modalWait();
  }

  
  async picturesSetup() {
    const { selectors } = this.data;
    const jobModal = this.jobModal();

    const saveJob = jobModal.locator(selectors.saveJobButton).filter({ visible: true }).first();
    await expect(saveJob).toBeVisible({ timeout: 120000 });
    await saveJob.scrollIntoViewIfNeeded();
    await saveJob.click();
    await expect(saveJob).not.toContainText(/sending/i, { timeout: 120000 });
    await this.modalWait();
  }

  private async selectDate(form: Locator, selector: string, date: Date) {
    const formatted = this.formatDate(date);
    const input = form.locator(selector);
    await input.click();
    await input.fill(formatted);
    await input.press('Enter');
    await this.modalWait(500);
  }

  private formatDate(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
