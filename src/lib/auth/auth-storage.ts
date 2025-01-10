import { nanoid } from 'nanoid';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const authTokenKey = 'auth_token';
const anonymousIdKey = 'anonymous_id';

export function getStoredToken() {
  return storage.getString(authTokenKey);
}

export function setStoredToken(token: string) {
  storage.set(authTokenKey, token);
}

export function deleteStoredToken() {
  storage.delete(authTokenKey);
}

export function deleteStoredAnonymousId() {
  storage.delete(anonymousIdKey);
}

export function getOrCreateStoredAnonymousId() {
  const possibleAnonymousId = storage.getString(anonymousIdKey);
  const anonymousId = possibleAnonymousId ?? nanoid();
  if (!possibleAnonymousId) {
    storage.set(anonymousIdKey, anonymousId);
  }
  return anonymousId;
}
