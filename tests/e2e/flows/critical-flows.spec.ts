import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HabitsPage } from '../pages/habits.page';
import { LoginPage } from '../pages/login.page';

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Set ${name} in the local test environment before running this flow.`);
  }
  return value;
}

async function signInAsQa(page: Page): Promise<void> {
  const login = new LoginPage(page);
  await login.open();
  await login.signIn(
    requiredEnvironment('E2E_TEST_EMAIL'),
    requiredEnvironment('E2E_TEST_PASSWORD'),
  );
}

test.describe('AUT-E2E critical business flows', () => {
  test('AUT-E2E-02 TC-AUTH-01: valid credentials open the user profile', async ({ page }) => {
    // Arrange: use the dedicated QA account provided by the local environment.
    const login = new LoginPage(page);
    await login.open();

    // Act: sign in through the same form as a user.
    const profile = await login.signIn(
      requiredEnvironment('E2E_TEST_EMAIL'),
      requiredEnvironment('E2E_TEST_PASSWORD'),
    );

    // Assert: successful authentication navigates to the account profile.
    expect(await profile.currentUrl()).toMatch(/\/perfil\/\d+/);
  });

  const invalidCredentialCases = [
    { label: 'both fields empty', email: '', password: '', blocked: true },
    { label: 'malformed email', email: 'no-es-correo', password: 'Clave-invalida-123!', blocked: true },
    { label: 'unknown account', email: 'no-existe@example.test', password: 'Clave-invalida-123!', blocked: false },
    { label: 'known account with wrong password', email: 'qa-account', password: 'wrong-password', blocked: false },
  ];

  for (const scenario of invalidCredentialCases) {
    test(`AUT-E2E-03 TC-AUTH-02: rejects ${scenario.label}`, async ({ page }) => {
      // Arrange: use invalid values; the QA password stays outside the repository.
      const login = new LoginPage(page);
      await login.open();
      const email = scenario.email === 'qa-account'
        ? requiredEnvironment('E2E_TEST_EMAIL')
        : scenario.email;
      const password = scenario.password === 'wrong-password'
        ? `${requiredEnvironment('E2E_TEST_PASSWORD')}-incorrecta`
        : scenario.password;

      // Act: submit the invalid combination when the browser enables the button.
      await login.submitCredentials(email, password);

      // Assert: invalid form data is blocked and invalid credentials are rejected.
      expect(await login.submitIsDisabled()).toBe(scenario.blocked);
      if (!scenario.blocked) {
        await login.waitForError();
        expect(await login.errorIsVisible()).toBe(true);
      }
    });
  }

  test('AUT-E2E-04 TC-HAB-01..05: add, edit, complete and remove a routine exercise', async ({ page }) => {
    // Arrange: authenticate with a dedicated QA user and use a seeded exercise.
    await signInAsQa(page);
    const habits = new HabitsPage(page);
    await habits.open();
    const exerciseId = requiredEnvironment('E2E_TEST_EXERCISE_ID');
    const exerciseName = requiredEnvironment('E2E_TEST_EXERCISE_NAME');
    await habits.ensureExerciseAvailable(exerciseId, exerciseName);

    // Act: exercise the routine's create, update, complete and delete operations.
    await habits.addExercise(exerciseId, exerciseName);
    // The branch serializer currently hides the exercise ID; keep this as a soft
    // assertion so the remainder of the CRUD flow still records its evidence.
    expect.soft(
      await habits.exerciseIsMarkedAdded(exerciseId),
      'BUG-HAB-05 candidate: the exercise card should reflect that it is in the routine',
    ).toBe(true);
    await habits.changeRoutineTarget(exerciseName, '35');
    await habits.expectRoutineTarget(exerciseName, '35');
    await habits.markRoutineCompleted(exerciseName);
    await habits.deleteRoutine(exerciseName);

    // Assert: deletion removes the routine and makes the exercise available again.
    await habits.expectRoutineRemoved(exerciseName);
    await habits.expectExerciseAvailable(exerciseId);
  });

  test('AUT-E2E-05: the routine PDF download produces a named PDF file', async ({ page }) => {
    // Arrange: authenticate and ensure the QA exercise is in a known state.
    await signInAsQa(page);
    const habits = new HabitsPage(page);
    await habits.open();
    const exerciseId = requiredEnvironment('E2E_TEST_EXERCISE_ID');
    const exerciseName = requiredEnvironment('E2E_TEST_EXERCISE_NAME');
    await habits.ensureExerciseAvailable(exerciseId, exerciseName);
    await habits.addExercise(exerciseId, exerciseName);

    // Act: download the routine PDF through the visible UI control.
    const downloadPromise = page.waitForEvent('download');
    await habits.downloadRoutinePdf();
    const download = await downloadPromise;

    // Assert: the browser receives the expected PDF artifact.
    expect(download.suggestedFilename()).toMatch(/^rutina_completa_\d+\.pdf$/);
    await habits.deleteRoutine(exerciseName);
  });
});
