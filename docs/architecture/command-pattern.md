# Command Pattern Implementation

All state mutations that should be undoable and logged are wrapped in commands. This document covers the command interface, factories, debouncing strategy, registry, and integration with Zundo.

---

## Command Interface

```typescript
interface Command {
  /** Unique command type identifier, e.g. 'cv:update-profile-field' */
  type: string;

  /** Human-readable description, e.g. 'Updated title to "Senior Engineer"' */
  description: string;

  /** When the command was executed */
  timestamp: number;

  /** Apply the mutation */
  execute: () => void;

  /** Reverse the mutation */
  undo: () => void;
}
```

---

## Command Factories

Commands are created by factory functions that capture the before/after context via closure. Each feature defines its own command factories.

```typescript
// src/lib/commands/cv-commands.ts

function updateProfileFieldCommand(
  field: keyof Profile,
  newValue: LocalizedString,
  previousValue: LocalizedString
): Command {
  return {
    type: 'cv:update-profile-field',
    description: `Updated ${field}`,
    timestamp: Date.now(),
    execute: () => {
      useCvStore.getState().setProfileField(field, newValue);
    },
    undo: () => {
      useCvStore.getState().setProfileField(field, previousValue);
    },
  };
}

function reorderSectionsCommand(
  fromIndex: number,
  toIndex: number
): Command {
  return {
    type: 'cv:reorder-sections',
    description: `Moved section from position ${fromIndex + 1} to ${toIndex + 1}`,
    timestamp: Date.now(),
    execute: () => {
      useCvStore.getState().applySectionReorder(fromIndex, toIndex);
    },
    undo: () => {
      useCvStore.getState().applySectionReorder(toIndex, fromIndex);
    },
  };
}
```

---

## Debouncing Strategy for Rapid Edits

Text input generates many mutations per second. These must be coalesced into a single logical command (e.g., "Updated title") rather than one per keystroke.

Strategy: **trailing debounce with command merging.** While the user is typing in the same field, mutations accumulate. When input pauses (300ms default), a single command is recorded that captures the state before the first keystroke and the state after the last.

```typescript
interface DebouncedCommandContext {
  type: string;
  field: string;
  originalValue: unknown;  // Captured once, on first keystroke
  timer: ReturnType<typeof setTimeout> | null;
}

const activeContexts = new Map<string, DebouncedCommandContext>();

function debouncedCommand(
  key: string,         // Unique key per field, e.g. 'profile.title'
  type: string,
  description: string,
  getCurrentValue: () => unknown,
  delayMs: number = 300
): void {
  let ctx = activeContexts.get(key);

  if (!ctx) {
    // First mutation in this debounce window -- capture the original value
    ctx = {
      type,
      field: key,
      originalValue: structuredClone(getCurrentValue()),
      timer: null,
    };
    activeContexts.set(key, ctx);
  }

  // Reset the debounce timer
  if (ctx.timer) clearTimeout(ctx.timer);
  ctx.timer = setTimeout(() => {
    const finalValue = getCurrentValue();
    commandRegistry.record({
      type: ctx!.type,
      description,
      timestamp: Date.now(),
      execute: () => { /* already applied */ },
      undo: () => {
        // Restore the original value from before the debounce window
        useCvStore.getState().setProfileField(ctx!.field as keyof Profile, ctx!.originalValue as LocalizedString);
      },
    });
    activeContexts.delete(key);
  }, delayMs);
}
```

---

## Command Registry

The command registry maintains the log of executed commands. It stores commands per snapshot interval, so each snapshot carries a description of what changed since the previous one.

```typescript
class CommandRegistry {
  private currentLog: Command[] = [];

  /** Record a command that has already been executed */
  record(command: Command): void {
    this.currentLog.push(command);
  }

  /** Get all commands since last snapshot */
  getCommandsSinceLastSnapshot(): Command[] {
    return [...this.currentLog];
  }

  /** Called when a snapshot is created. Returns the commands to attach to it, then resets. */
  flush(): Command[] {
    const flushed = this.currentLog;
    this.currentLog = [];
    return flushed;
  }
}

export const commandRegistry = new CommandRegistry();
```

---

## Integration with Zundo

Zundo and the command system serve complementary roles:

- **Zundo** handles the actual undo/redo state transitions. It stores state snapshots in memory and can restore any previous state. This is the mechanism.
- **Command registry** provides the human-readable narrative. It records what the user did in named terms. This powers the action history UI and snapshot descriptions.

They do not conflict because:
1. The command middleware records the command metadata.
2. Zundo's `temporal` middleware (wrapped around the same store) independently tracks state snapshots.
3. Undo/redo calls `useCvStore.temporal.getState().undo()` -- Zundo restores the previous state.
4. The command registry is informational only; it never drives state transitions.

```
User action
  |
  +--> Command middleware records { type, description }
  |
  +--> Zustand set() updates state
  |
  +--> Zundo temporal middleware captures state snapshot
  |
  +--> Persistence subscription triggers debounced auto-save
```
