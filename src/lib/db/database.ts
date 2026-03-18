import Dexie, { type Table } from "dexie";

import type {
  EntityId,
  Profile,
  CvDocument,
  Snapshot,
  WorkingState,
  ThemeDefinition,
  AppSettings,
  StoredBlob,
} from "@/lib/types";

export class CvGeniusDatabase extends Dexie {
  profiles!: Table<Profile, EntityId>;
  cvs!: Table<CvDocument, EntityId>;
  snapshots!: Table<Snapshot, EntityId>;
  workingStates!: Table<WorkingState, EntityId>;
  themes!: Table<ThemeDefinition, EntityId>;
  settings!: Table<AppSettings, string>;
  blobs!: Table<StoredBlob, EntityId>;

  constructor() {
    super("cv-genius");

    this.version(1).stores({
      profiles: "id, updatedAt",
      cvs: "id, profileId, themeId, updatedAt",
      snapshots: "id, cvId, timestamp",
      workingStates: "cvId",
      themes: "id, name",
      settings: "id",
      blobs: "id, createdAt",
    });
  }
}

export const db = new CvGeniusDatabase();
