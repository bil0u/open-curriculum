# Command Pattern Implementation

All state mutations that should be undoable and logged are wrapped in commands. This document covers the two command types, their roles, and the phased implementation plan.

---

## Phased Implementation

### MVP — Zundo Only

For MVP, undo/redo is handled entirely by Zundo's `temporal` middleware, which tracks state snapshots in memory. No command middleware, no command registry, no debounced command merging.

This is sufficient because:
- Zundo provides undo/redo state transitions out of the box.
- The action history UI and snapshot descriptions (which need the command registry) are V1.1 features.
- Zundo's `equality` option handles deduplication of no-op changes.
- Rapid edit coalescing can be handled by Zundo's `handleSet` with throttling.

### V1.1 — Command Middleware + Registry

When building the snapshot/history UI, the command system will be added:
1. **Command middleware** wraps the Zustand store's `set()` to record metadata about each mutation.
2. **Command registry** accumulates command records between snapshots.
3. **Debounced command merging** coalesces rapid keystrokes into single logical commands.

The middleware stack will become:
```
commandMiddleware(subscribeWithSelector(temporal(storeCreator)))
```

---

## Command Types

There are two distinct command types, serving different purposes:

### `ExecutableCommand` (In-Memory, V1.1+)

Used by command factories to define mutations with execute/undo behavior. These are the behavioral objects that drive the command middleware.

```typescript
interface ExecutableCommand {
  /** Command type from the CommandType union */
  type: CommandType;

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

### `CommandRecord` (Persisted, V1.1+)

Data record stored in snapshots. Contains before/after state for diffing and history display. This is the serializable form attached to `Snapshot.commandLog`.

```typescript
interface CommandRecord {
  id: EntityId;
  type: CommandType;
  /** Human-readable description */
  description: string;
  timestamp: ISODateTimeString;
  /** Operation-specific payload for history display and diffing */
  data: {
    before: unknown;
    after: unknown;
  };
}
```

### `CommandType` Union

Shared by both command types. Defines all possible mutation categories:

```typescript
type CommandType =
  | 'profile.update'
  | 'section.add'
  | 'section.remove'
  | 'section.update'
  | 'section.reorder'
  | 'section.toggle-visibility'
  | 'item.add'
  | 'item.remove'
  | 'item.update'
  | 'item.reorder'
  | 'theme.change'
  | 'theme.override'
  | 'layout.change'
  | 'locale.add'
  | 'locale.remove'
  | 'page-format.change'
  | 'cv.rename';
```

---

## Command Factories (V1.1+)

Commands are created by factory functions that capture the before/after context via closure. Each feature defines its own command factories.

```typescript
function updateProfileOverrideCommand(
  field: string,
  newValue: unknown,
  previousValue: unknown
): ExecutableCommand {
  return {
    type: 'profile.update',
    description: `Updated ${field}`,
    timestamp: Date.now(),
    execute: () => {
      useCvStore.getState().updateProfileOverride(field, newValue);
    },
    undo: () => {
      useCvStore.getState().updateProfileOverride(field, previousValue);
    },
  };
}
```

---

## Debouncing Strategy (V1.1+)

Text input generates many mutations per second. These must be coalesced into a single logical command (e.g., "Updated title") rather than one per keystroke.

Strategy: **trailing debounce with command merging.** While the user is typing in the same field, mutations accumulate. When input pauses (300ms default), a single command record is created that captures the state before the first keystroke and the state after the last.

---

## Command Registry (V1.1+)

The command registry maintains the log of executed commands per snapshot interval. When a snapshot is created, the accumulated commands are attached to it, then the log resets.

```typescript
class CommandRegistry {
  private currentLog: CommandRecord[] = [];

  record(command: CommandRecord): void {
    this.currentLog.push(command);
  }

  getCommandsSinceLastSnapshot(): CommandRecord[] {
    return [...this.currentLog];
  }

  flush(): CommandRecord[] {
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

- **Zundo** handles the actual undo/redo state transitions (the mechanism).
- **Command registry** provides the human-readable narrative (the history UI).

They do not conflict because:
1. The command middleware records metadata (type, description) — it does not drive state.
2. Zundo's `temporal` middleware independently tracks state snapshots.
3. Undo/redo calls `useCvStore.temporal.getState().undo()` — Zundo restores the previous state.
4. The command registry is informational only.

```
User action
  |
  +--> Zustand set() updates state
  |
  +--> Zundo temporal middleware captures state snapshot
  |
  +--> Command middleware records { type, description }  (V1.1+)
  |
  +--> Persistence subscription triggers debounced auto-save
```
