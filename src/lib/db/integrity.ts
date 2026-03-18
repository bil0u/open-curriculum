import type { CvDocument } from "@/lib/types";
import type { Result } from "@/lib/utils";
import { err, ok } from "@/lib/utils";

/**
 * Lightweight structural validation for CvDocument (DS-06).
 *
 * Checks that the document has the minimum required fields to be loadable.
 * Does NOT validate content completeness (that's non-blocking validation in the editor).
 */
export function validateCvDocument(doc: unknown): Result<CvDocument, string> {
  if (!doc || typeof doc !== "object") {
    return err("Document is null or not an object");
  }

  const d = doc as Record<string, unknown>;

  if (typeof d.id !== "string" || d.id.length === 0) {
    return err("Document missing valid id");
  }

  if (typeof d.name !== "string") {
    return err("Document missing name");
  }

  if (d.profileOverrides !== undefined && typeof d.profileOverrides !== "object") {
    return err("Document has invalid profileOverrides");
  }

  if (!Array.isArray(d.sections)) {
    return err("Document missing sections array");
  }

  if (typeof d.themeId !== "string" || d.themeId.length === 0) {
    return err("Document missing themeId");
  }

  if (typeof d.defaultLocale !== "string") {
    return err("Document missing defaultLocale");
  }

  if (!Array.isArray(d.availableLocales) || d.availableLocales.length === 0) {
    return err("Document missing availableLocales");
  }

  if (!d.pageFormat) {
    return err("Document missing pageFormat");
  }

  if (typeof d.createdAt !== "string" || typeof d.updatedAt !== "string") {
    return err("Document missing timestamps");
  }

  return ok(doc as CvDocument);
}
