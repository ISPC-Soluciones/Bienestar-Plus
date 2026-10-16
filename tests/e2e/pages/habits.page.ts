import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class HabitsPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/habitos');
  }

  async addExercise(exerciseId: string, exerciseName: string): Promise<void> {
    const card = this.page.getByTestId(`exercise-card-${exerciseId}`);
    await card.getByTestId('exercise-add').click();
    await this.routineItem(exerciseName).waitFor({ state: 'visible' });
  }

  async ensureExerciseAvailable(exerciseId: string, exerciseName: string): Promise<void> {
    const card = this.page.getByTestId(`exercise-card-${exerciseId}`);
    const addButton = card.getByTestId('exercise-add');
    const addedButton = card.getByTestId('exercise-added');
    await expect(addButton.or(addedButton)).toBeVisible();
    if (await addedButton.isVisible()) {
      await this.deleteRoutine(exerciseName);
    }
    await expect(addButton).toBeVisible();
  }

  async exerciseIsMarkedAdded(exerciseId: string): Promise<boolean> {
    const card = this.page.getByTestId(`exercise-card-${exerciseId}`);
    return card.getByTestId('exercise-added').isVisible();
  }

  async expectRoutineTarget(exerciseName: string, target: string): Promise<void> {
    await expect(this.routineItem(exerciseName)).toContainText(target);
  }

  async expectRoutineRemoved(exerciseName: string): Promise<void> {
    await expect(this.routineItem(exerciseName)).toHaveCount(0);
  }

  async expectExerciseAvailable(exerciseId: string): Promise<void> {
    const card = this.page.getByTestId(`exercise-card-${exerciseId}`);
    await expect(card.getByTestId('exercise-add')).toBeVisible();
  }

  async changeRoutineTarget(exerciseName: string, amount: string): Promise<void> {
    const item = this.routineItem(exerciseName);
    await item.getByTestId('routine-edit').click();
    await item.getByTestId('routine-quantity').fill(amount);
    await item.getByTestId('routine-save').click();
  }

  async markRoutineCompleted(exerciseName: string): Promise<void> {
    const item = this.routineItem(exerciseName);
    await item.getByTestId('routine-complete').click();
    await item.getByTestId('routine-completed').waitFor({ state: 'visible' });
  }

  async deleteRoutine(exerciseName: string): Promise<void> {
    await this.routineItem(exerciseName).getByTestId('routine-delete').click();
  }

  async downloadRoutinePdf(): Promise<void> {
    await this.page.getByTestId('routine-download-pdf').click();
  }

  private routineItem(exerciseName: string): Locator {
    return this.routineItems().filter({ hasText: exerciseName }).first();
  }

  private routineItems(): Locator {
    return this.page.locator('[data-testid^="routine-item-"]');
  }

}
