import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

export default { decodeToken, isTokenExpired };
