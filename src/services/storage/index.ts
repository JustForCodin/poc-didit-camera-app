/**
 * Storage Services
 *
 * Barrel export for storage-related services.
 */

export {
  getCredential,
  setCredential,
  deleteCredential,
  hasCredential,
  clearAllCredentials,
  CREDENTIAL_KEYS,
  STORAGE_ERROR_MESSAGES,
  getStorageErrorMessage,
} from './secureStorage';

export type { CredentialKey } from './secureStorage';
