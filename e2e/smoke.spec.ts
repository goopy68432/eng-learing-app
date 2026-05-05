import { test, expect } from '@playwright/test';

test('home → reader → reveal → bookmark → vocab', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'EngReader', level: 1 })).toBeVisible();

  // Click into the climate doc from home
  await page.getByRole('link', { name: /Climate Talks Stall/ }).click();
  await expect(page.getByText(/Despite the heavy rain/)).toBeVisible();

  // Stage 1
  await page.getByRole('button', { name: /1단계 펼치기/ }).first().click();
  await expect(page.getByText(/폭우에도 불구하고/)).toBeVisible();

  // Stage 2
  await page.getByRole('button', { name: /2단계 펼치기/ }).first().click();
  await expect(page.getByText(/계속 밀고 나가다/)).toBeVisible();

  // Bookmark first sentence
  await page.getByRole('button', { name: '북마크' }).first().click();
  await page.goto('/bookmarks/');
  await expect(page.getByText(/samples\/news\/climate-2026/)).toBeVisible();

  // Add vocab via star next to "press on"
  await page.goto('/read/samples/news/climate-2026/');
  await page.getByRole('button', { name: /1단계 펼치기/ }).first().click();
  await page.getByRole('button', { name: /2단계 펼치기/ }).first().click();
  await page.getByRole('button', { name: /단어장 추가: press on/ }).click();
  await page.goto('/vocab/');
  await expect(page.getByText('press on')).toBeVisible();
});

test('unpaired notice shows for orwell entry', async ({ page }) => {
  await page.goto('/read/samples/essays/orwell-politics/');
  await expect(page.getByText(/학습자료가 없습니다/)).toBeVisible();
});
