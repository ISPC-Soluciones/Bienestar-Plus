import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { HabitsPage } from "../pages/habits.page";
import { LoginPage } from "../pages/login.page";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function assertNoSeriousViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  const seriousViolations = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );
  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual(
    [],
  );
}

async function captureAccessibilityEvidence(
  page: Page,
  screen: string,
): Promise<void> {
  const evidenceDirectory = resolve(process.cwd(), "../reports/lighthouse");
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: resolve(evidenceDirectory, `${screen}.png`),
    fullPage: true,
  });
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Set ${name} in the local test environment before running accessibility checks.`,
    );
  }
  return value;
}

test.describe("ACC-01: automated accessibility checks", () => {
  for (const screen of [
    { id: "login", path: "/login" },
    { id: "registration", path: "/registro" },
  ]) {
    test(`${screen.id} has no critical or serious axe violations`, async ({
      page,
    }) => {
      // Arrange: open a public screen supported by the current Develop branch.
      await page.goto(screen.path);
      await captureAccessibilityEvidence(page, screen.id);

      // Act and assert: scan against WCAG 2.2 A/AA and reject serious findings.
      await assertNoSeriousViolations(page);
    });
  }

  test("exercise routine screen has no critical or serious axe violations", async ({
    page,
  }) => {
    // Arrange: authenticate because the routine screen reads the active QA user.
    const login = new LoginPage(page);
    await login.open();
    await login.signIn(
      requiredEnvironment("E2E_TEST_EMAIL"),
      requiredEnvironment("E2E_TEST_PASSWORD"),
    );
    const habits = new HabitsPage(page);
    await habits.open();
    await captureAccessibilityEvidence(page, "habitos");

    // Act and assert: scan the current core business screen.
    await assertNoSeriousViolations(page);
  });
  test("home has no critical or serious axe violations", async ({ page }) => {
    await page.goto("/home");
    await captureAccessibilityEvidence(page, "home");
    await assertNoSeriousViolations(page);
  });
});
