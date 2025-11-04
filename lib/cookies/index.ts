import { cookies } from "next/headers";

const ACCESS_TOKEN_KEY = "token";

export function getAccessToken() {
  return cookies().get(ACCESS_TOKEN_KEY)?.value || null;
}

export function setAccessToken(token: string, expiresInSeconds?: number) {
  cookies().set(ACCESS_TOKEN_KEY, token, {
    httpOnly: true,
    maxAge: expiresInSeconds,
  });
}

export function clearToken() {
  cookies().delete(ACCESS_TOKEN_KEY);
}
