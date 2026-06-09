```markdown
# dice Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the development patterns and conventions used in the `dice` TypeScript codebase. You'll learn about file naming, import/export styles, commit patterns, and how to write and run tests. The repository does not use a specific framework, focusing on clean TypeScript practices.

## Coding Conventions

### File Naming
- Use **PascalCase** for file names.
  - Example: `DiceRoller.ts`, `RandomGenerator.ts`

### Import Style
- Use **relative imports** for referencing other modules.
  - Example:
    ```typescript
    import { DiceRoller } from './DiceRoller';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    export function rollDice(sides: number): number {
      // implementation
    }
    ```

### Commit Patterns
- Commit messages are **freeform** (no enforced prefixes).
- Average commit message length: **61 characters**.
  - Example:  
    ```
    Add support for custom dice notation in DiceRoller
    ```

## Workflows

### Adding a New Module
**Trigger:** When you need to add a new feature or utility.
**Command:** `/add-module`

1. Create a new file using PascalCase (e.g., `NewFeature.ts`).
2. Implement your logic using TypeScript.
3. Use named exports for all functions or classes.
4. Import other modules using relative paths as needed.
5. Write a corresponding test file (e.g., `NewFeature.test.ts`).
6. Commit your changes with a descriptive message.

### Writing and Running Tests
**Trigger:** When you add or modify code and need to ensure correctness.
**Command:** `/run-tests`

1. Create a test file matching the pattern `*.test.*` (e.g., `DiceRoller.test.ts`).
2. Write your test cases using your preferred testing framework.
3. Run the tests using the project's test runner (framework not specified; check project scripts).
4. Review test results and fix any failures.

### Making a Commit
**Trigger:** After making changes to the codebase.
**Command:** `/commit-changes`

1. Stage your changes.
2. Write a clear, descriptive commit message (no prefix required).
3. Commit your changes.

## Testing Patterns

- Test files follow the `*.test.*` naming convention (e.g., `DiceRoller.test.ts`).
- The specific testing framework is **unknown**; check the repository for details.
- Place test files alongside or near the modules they test.
- Example test file structure:
  ```typescript
  import { rollDice } from './DiceRoller';

  describe('rollDice', () => {
    it('returns a number between 1 and sides', () => {
      const result = rollDice(6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });
  });
  ```

## Commands
| Command         | Purpose                                   |
|-----------------|-------------------------------------------|
| /add-module     | Scaffold and add a new module             |
| /run-tests      | Run all test suites                       |
| /commit-changes | Commit staged changes with a message      |
```
