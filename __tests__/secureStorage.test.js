// Mock expo-secure-store
jest.mock('expo-secure-store', () => {
  const store = {};
  return {
    setItemAsync: jest.fn((key, value) => { store[key] = value; return Promise.resolve(); }),
    getItemAsync: jest.fn((key) => Promise.resolve(store[key] ?? null)),
    deleteItemAsync: jest.fn((key) => { delete store[key]; return Promise.resolve(); }),
    _store: store,
  };
});

import SecureStorage from '../utils/secureStorage';
import * as SecureStore from 'expo-secure-store';

beforeEach(() => {
  jest.clearAllMocks();
  // Reset the internal store
  Object.keys(SecureStore._store).forEach((k) => delete SecureStore._store[k]);
});

describe('SecureStorage.setItem / getItem', () => {
  it('stores and retrieves a value', async () => {
    await SecureStorage.setItem('key1', 'value1');
    const result = await SecureStorage.getItem('key1');
    expect(result).toBe('value1');
  });

  it('returns null for missing key', async () => {
    const result = await SecureStorage.getItem('nonexistent');
    expect(result).toBeNull();
  });
});

describe('SecureStorage.setToken / getToken', () => {
  it('stores and retrieves token', async () => {
    await SecureStorage.setToken('my-jwt-token');
    const token = await SecureStorage.getToken();
    expect(token).toBe('my-jwt-token');
  });

  it('returns null for empty token string', async () => {
    await SecureStorage.setItem('token', '   ');
    const token = await SecureStorage.getToken();
    expect(token).toBeNull();
  });

  it('removes token with removeToken', async () => {
    await SecureStorage.setToken('abc');
    await SecureStorage.removeToken();
    expect(await SecureStorage.getToken()).toBeNull();
  });
});

describe('SecureStorage.setProfile / getProfile', () => {
  const profile = { client_id: 1, prof_id: { prof_firstname: 'John' } };

  it('stores and retrieves profile', async () => {
    await SecureStorage.setProfile(profile);
    const result = await SecureStorage.getProfile();
    expect(result).toEqual(profile);
  });

  it('returns null when no profile set', async () => {
    const result = await SecureStorage.getProfile();
    expect(result).toBeNull();
  });
});
