# Profile

```typescript
interface SocialLink {
  platform: string;
  url: string;
  label?: Translatable;
}

/**
 * Miscellaneous profile info common on European CVs
 * (driving license, nationality, date of birth, etc.)
 */
interface ProfileMeta {
  key: string;
  label: Translatable;
  value: Translatable;
}

interface Profile {
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
```
