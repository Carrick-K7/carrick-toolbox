import { test, expect } from '@playwright/test';

test.describe('Toolbox 基础功能', () => {
  test('首页加载正常', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('body')).toBeVisible();
  });
});
