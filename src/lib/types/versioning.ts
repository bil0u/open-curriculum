import type { CvDocument } from "./cv-document";
import type { EntityId, ISODateTimeString } from "./foundational";

export type CommandType =
  | "profile.update"
  | "section.add"
  | "section.remove"
  | "section.update"
  | "section.reorder"
  | "section.toggle-visibility"
  | "item.add"
  | "item.remove"
  | "item.update"
  | "item.reorder"
  | "theme.change"
  | "theme.override"
  | "layout.change"
  | "locale.add"
  | "locale.remove"
  | "page-format.change"
  | "cv.rename";

/**
 * Serializable data record attached to snapshots.
 * Contains before/after state for history display and diffing.
 * Distinct from ExecutableCommand (in-memory behavioral object, V1.1+).
 */
export interface CommandRecord {
  id: EntityId;
  type: CommandType;
  description: string;
  timestamp: ISODateTimeString;
  data: {
    before: unknown;
    after: unknown;
  };
}

export interface Snapshot {
  id: EntityId;
  cvId: EntityId;
  state: CvDocument;
  commandLog: CommandRecord[];
  timestamp: ISODateTimeString;
  tag?: string;
}

export interface WorkingState {
  cvId: EntityId;
  state: CvDocument;
  lastModified: ISODateTimeString;
}
