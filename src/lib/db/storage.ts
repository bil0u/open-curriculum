/**
 * Request persistent storage from the browser (DS-01).
 *
 * When granted, the browser will not evict IndexedDB data under storage pressure.
 * Returns `true` if already persisted or newly granted, `false` if denied or unsupported.
 * Never throws — this is a best-effort request.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) {
    return false;
  }

  try {
    const alreadyPersisted = await navigator.storage.persisted();
    if (alreadyPersisted) {
      return true;
    }
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
