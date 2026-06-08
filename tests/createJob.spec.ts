import { test } from '@playwright/test';
import loginData from '../fixtures/login.json';
import jobData from '../fixtures/job.json';
import { LoginPage } from '../pages/login.page';
import { CreateJobPage } from '../pages/createJobPage';

test('create job settings and role setup', async ({ page }) => {
  test.setTimeout(300000);

  const loginPage = new LoginPage(page, loginData);
  await loginPage.login2();

  const createJobPage = new CreateJobPage(page, jobData);
  await createJobPage.createJobSettings();
  await createJobPage.roleSetup();
  await createJobPage.demurrageSetup();
  await createJobPage.productSetup();
  await createJobPage.carrierSetup();
  await createJobPage.permissionsSetup();
  await createJobPage.terminalSetup();
  await createJobPage.notesSetup();
  await createJobPage.picturesSetup();
});
