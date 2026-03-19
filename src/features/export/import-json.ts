import { db } from "@/lib/db";
import { validateCvDocument } from "@/lib/db/integrity";
import { regenerateIds } from "@/lib/store/helpers";
import type { CvDocument, EntityId, Profile } from "@/lib/types";
import type { Result } from "@/lib/utils";
import { err, generateId, generateISODateTime, isOk, ok } from "@/lib/utils";

export function parseImportFile(
  fileContent: string,
): Result<{ cv: CvDocument; profile: Profile | null }, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch {
    return err("Invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    return err("Expected a JSON object");
  }

  const envelope = parsed as Record<string, unknown>;

  if (envelope.format !== "cv-genius") {
    return err("Not a CV Genius export file");
  }

  if (typeof envelope.version !== "string") {
    return err("Missing version field");
  }

  if (envelope.version !== "1.0.0") {
    return err(`Unsupported version: ${envelope.version}`);
  }

  const cvResult = validateCvDocument(envelope.cv);
  if (!isOk(cvResult)) {
    return err(`Invalid CV data: ${cvResult.error}`);
  }

  let profile: Profile | null = null;
  if (envelope.profile != null) {
    if (typeof envelope.profile !== "object") {
      return err("Invalid profile data");
    }
    const p = envelope.profile as Record<string, unknown>;
    if (typeof p.id !== "string" || typeof p.name !== "object") {
      return err("Profile missing required fields (id, name)");
    }
    profile = envelope.profile as Profile;
  }

  return ok({ cv: cvResult.value, profile });
}

export async function importCvFromFile(
  file: File,
): Promise<Result<{ cvId: EntityId }, string>> {
  const content = await file.text();
  const parseResult = parseImportFile(content);

  if (!isOk(parseResult)) {
    return err(parseResult.error);
  }

  const { profile } = parseResult.value;
  let cv = regenerateIds(parseResult.value.cv);

  if (profile) {
    const newProfileId = generateId();
    const now = generateISODateTime();
    const newProfile: Profile = {
      ...profile,
      id: newProfileId,
      createdAt: now,
      updatedAt: now,
    };
    cv = { ...cv, profileId: newProfileId };

    await db.transaction("rw", [db.cvs, db.profiles], async () => {
      await db.profiles.put(newProfile);
      await db.cvs.put(cv);
    });
  } else {
    cv = { ...cv, profileId: null };
    await db.cvs.put(cv);
  }

  return ok({ cvId: cv.id });
}
