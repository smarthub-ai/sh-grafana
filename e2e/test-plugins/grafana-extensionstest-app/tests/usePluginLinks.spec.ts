import { test, expect } from '@grafana/plugin-e2e';

import pluginJson from '../plugin.json';
import { testIds } from '../testIds';

test('should extend the actions menu with a link to a-app plugin', async ({ page }) => {
  await page.goto(`/a/${pluginJson.id}/added-links`);
  const section = await page.getByTestId(testIds.addedLinksPage.section1);
  await section.getByTestId(testIds.actions.button).click();
  await page.getByTestId(testIds.container).getByText('Go to A').click();
  await page.getByTestId(testIds.modal.open).click();
  await expect(page.getByTestId(testIds.appA.container)).toBeVisible();
});

test('should extend main app with link extension from app B', async ({ page }) => {
  await page.goto(`/a/${pluginJson.id}/added-links`);
  const section = await page.getByTestId(testIds.addedLinksPage.section1);
  await section.getByTestId(testIds.actions.button).click();
  await page.getByTestId(testIds.container).getByText('Open from B').click();
  await expect(page.getByTestId(testIds.appB.modal)).toBeVisible();
});

test('should extend main app with basic link extension from app A', async ({ page }) => {
  await page.goto(`/a/${pluginJson.id}/added-links`);
  const section = await page.getByTestId(testIds.addedLinksPage.section1);
  await section.getByTestId(testIds.actions.button).click();
  await page.getByTestId(testIds.container).getByText('Basic link').click();
  await page.getByTestId(testIds.modal.open).click();
  await expect(page.getByTestId(testIds.appA.container)).toBeVisible();
});
