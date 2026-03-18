# Versioning Types

## CommandType

Shared union of all possible mutation categories. Used by both `ExecutableCommand` (in-memory, V1.1+) and `CommandRecord` (persisted).

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

## CommandRecord

Serializable data record attached to snapshots. Contains before/after state for history display and diffing. Distinct from `ExecutableCommand` (see `command-pattern.md`), which is an in-memory behavioral object with `execute()`/`undo()` methods.

```typescript
interface CommandRecord {
  id: EntityId;
  type: CommandType;
  /** Human-readable description (e.g., 'Updated title: "Engineer" -> "Senior Engineer"') */
  description: string;
  timestamp: ISODateTimeString;
  /**
   * Operation-specific payload. Contains before/after state or
   * parameters needed to display and diff the command.
   */
  data: {
    before: unknown;
    after: unknown;
  };
}
```

## Snapshot

```typescript
interface Snapshot {
  id: EntityId;
  cvId: EntityId;
  /** Full serialized CV state at the time of snapshot */
  state: CvDocument;
  /** Commands executed since the previous snapshot (V1.1+) */
  commandLog: CommandRecord[];
  timestamp: ISODateTimeString;
  /** Optional user-assigned label (tagged version) */
  tag?: string;
}
```

## WorkingState

```typescript
interface WorkingState {
  cvId: EntityId;
  /** Current in-progress CV state (overwritten on each auto-save) */
  state: CvDocument;
  lastModified: ISODateTimeString;
}
```
