import type { EntityId, ISODateTimeString } from "@/lib/types";

export function generateId(): EntityId {
  return crypto.randomUUID();
}

export function generateISODateTime(): ISODateTimeString {
  return new Date().toISOString();
}
