# Versioning Types

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

interface Command {
  id: EntityId;
  type: CommandType;
  /** Human-readable description (e.g., 'Updated title: "Engineer" -> "Senior Engineer"') */
  description: string;
  timestamp: ISODateTimeString;
  /**
   * Operation-specific payload. Contains before/after state or
   * parameters needed to execute and invert the command.
   */
  data: {
    before: unknown;
    after: unknown;
  };
}

interface Snapshot {
  id: EntityId;
  cvId: EntityId;
  /** Full serialized CV state at the time of snapshot */
  state: CvDocument;
  /** Commands executed since the previous snapshot */
  commandLog: Command[];
  timestamp: ISODateTimeString;
  /** Optional user-assigned label (tagged version) */
  tag?: string;
}

interface WorkingState {
  cvId: EntityId;
  /** Current in-progress CV state (overwritten on each auto-save) */
  state: CvDocument;
  lastModified: ISODateTimeString;
}
```
