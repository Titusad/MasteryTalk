/**
 * MasteryTalk PRO — Storage Key Migration
 * Migrates old `influentia_*` keys to `masterytalk_*` keys.
 * Runs once per session; safe to call multiple times.
 */

const MIGRATION_FLAG = "masterytalk_migrated";

const KEY_MAP: [string, string][] = [
  ["influentia_purchase_intent", "masterytalk_purchase_intent"],
  ["influentia_oauth_pending", "masterytalk_oauth_pending"],
  ["influentia_pending_setup", "masterytalk_pending_setup"],
  ["influentia_completed_lessons", "masterytalk_completed_lessons"],
  ["influentia_lang", "masterytalk_lang"],
  ["influentia_profile", "masterytalk_profile"],
  ["influentia_market_focus", "masterytalk_market_focus"],
];

const PREFIX_MAP: [string, string][] = [
  ["influentia_cache_", "masterytalk_cache_"],
];

function migrateStorage(storage: Storage) {
  for (const [oldKey, newKey] of KEY_MAP) {
    const value = storage.getItem(oldKey);
    if (value !== null) {
      storage.setItem(newKey, value);
      storage.removeItem(oldKey);
    }
  }

  for (const [oldPrefix, newPrefix] of PREFIX_MAP) {
    const keysToMigrate: [string, string][] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(oldPrefix)) {
        keysToMigrate.push([key, newPrefix + key.slice(oldPrefix.length)]);
      }
    }
    for (const [oldKey, newKey] of keysToMigrate) {
      const value = storage.getItem(oldKey);
      if (value !== null) {
        storage.setItem(newKey, value);
        storage.removeItem(oldKey);
      }
    }
  }
}

export function runStorageMigration() {
  try {
    if (sessionStorage.getItem(MIGRATION_FLAG)) return;

    migrateStorage(localStorage);
    migrateStorage(sessionStorage);

    sessionStorage.setItem(MIGRATION_FLAG, "1");
  } catch {
    // Storage unavailable (private browsing, etc.)
  }
}
