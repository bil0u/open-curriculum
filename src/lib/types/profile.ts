import type {
  EntityId,
  ISODateTimeString,
  Translatable,
  BlobReference,
} from "./foundational";

export interface SocialLink {
  platform: string;
  url: string;
  label?: Translatable;
}

/**
 * Miscellaneous profile info common on European CVs
 * (driving license, nationality, date of birth, etc.)
 */
export interface ProfileMeta {
  key: string;
  label: Translatable;
  value: Translatable;
}

export interface Profile {
  id: EntityId;
  name: Translatable;
  title: Translatable;
  email: Translatable;
  phone: Translatable;
  website: Translatable;
  location: Translatable;
  photo?: BlobReference;
  socialLinks: SocialLink[];
  meta: ProfileMeta[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
