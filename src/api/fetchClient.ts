import { auth, profile, sync, locked } from "../store/auth";
import type { Referrer, IAuthStoreLoginResponse } from "../types";

const BASE_URL = `/api/concierge`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = auth.get()?.token;
  const refreshToken = auth.get()?.refreshToken;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (refreshToken) {
    headers.set("X-Refresh-Token", refreshToken); // Add refresh token to headers
  }

  const fullUrl = new URL(BASE_URL + url, window.location.origin);

  try {
    const response = await fetch(fullUrl.toString(), {
      ...options,
      headers,
    });
    if (!response.ok) {
      if (response.status === 401) {
        // The server has already attempted to refresh the token.
        // If we're still getting a 401, it means we need to re-authenticate.
        logout(true);
        throw new Error("Authentication failed. Please log in again.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getTokens({
  fingerprint,
  codeword,
  email,
  encryptedCode,
  encryptedEmail,
  referrer,
}: {
  fingerprint?: string;
  codeword?: string;
  email?: string;
  encryptedCode?: string;
  encryptedEmail?: string;
  referrer: Referrer;
}) {
  try {
    const response = await fetchWithAuth("/auth/sync", {
      method: "POST",
      body: JSON.stringify({
        fingerprint,
        codeword,
        email,
        encryptedCode,
        encryptedEmail,
        referrer,
      }),
    });

    setRefreshedTokens(response);
    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      error: error instanceof Error ? error.message : String(error),
      jwt: null,
    };
  }
}

function setRefreshedTokens(response: IAuthStoreLoginResponse) {
  if (response.jwt) {
    auth.setKey("token", response.jwt);
  }
  if (response.refreshToken) {
    auth.setKey("refreshToken", response.refreshToken);
  }
  if (response.fingerprint) {
    auth.setKey("key", response.fingerprint);
  }
  if (response.firstname) {
    profile.set({
      ...profile.get(),
      firstname: response.firstname,
    });
  }
  if (response?.knownLead) {
    auth.setKey(`consent`, `1`);
  }
  if (response?.auth) {
    auth.setKey(`hasProfile`, `1`);
  } else {
    auth.setKey(`hasProfile`, undefined);
    auth.setKey("unlockedProfile", undefined);
  }
  auth.setKey("active", Date.now().toString());
}

function logout(full: boolean = false) {
  sync.set(false);
  locked.set(false);
  if (full) {
    auth.setKey("token", undefined);
  }
}

export { fetchWithAuth };
