import { isTokenExpired, decodeToken } from '../utils/tokenValidation';

// Helper: create a fake JWT with given exp (seconds from epoch)
function makeToken(exp) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ client_id: 1, exp }));
  return `${header}.${payload}.signature`;
}

describe('decodeToken', () => {
  it('returns null for null input', () => {
    expect(decodeToken(null)).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(decodeToken(123)).toBeNull();
  });

  it('returns null for malformed token', () => {
    expect(decodeToken('not.a.token')).toBeNull();
  });

  it('decodes a valid token', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeToken(exp);
    const decoded = decodeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.exp).toBe(exp);
  });
});

describe('isTokenExpired', () => {
  it('returns true for null token', () => {
    expect(isTokenExpired(null)).toBe(true);
  });

  it('returns true for malformed token', () => {
    expect(isTokenExpired('garbage')).toBe(true);
  });

  it('returns true for expired token', () => {
    const past = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    expect(isTokenExpired(makeToken(past))).toBe(true);
  });

  it('returns false for valid (future) token', () => {
    const future = Math.floor(Date.now() / 1000) + 3600; // 1 hour ahead
    expect(isTokenExpired(makeToken(future))).toBe(false);
  });

  it('returns true for token expiring exactly now', () => {
    const now = Math.floor(Date.now() / 1000) - 1;
    expect(isTokenExpired(makeToken(now))).toBe(true);
  });
});
