import { test, expect } from '@playwright/test';

// E2E covers the home page boot. Reader-page interactions are covered by
// Vitest component tests (SentenceCard, SentenceList) since the sutta content
// is gitignored and unavailable in CI.
test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'EngReader', level: 1 })).toBeVisible();
});

test('vocab page renders empty state', async ({ page }) => {
  await page.goto('/vocab/');
  await expect(page.getByText(/단어장이 비어있습니다/)).toBeVisible();
});

test('bookmarks page renders empty state', async ({ page }) => {
  await page.goto('/bookmarks/');
  await expect(page.getByText(/북마크가 없습니다/)).toBeVisible();
});
