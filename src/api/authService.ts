import type { APIContext } from "astro";

const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

export async function proxyRequestWithRefresh(
  url: string,
  options: RequestInit,
  context: APIContext
) {
  let response = await fetch(url, options);

  if (response.status === 401) {
    const cookies = context.cookies;
    const refreshToken = cookies.get("refreshToken")?.value;

    if (refreshToken) {
      const { newAccessToken, newRefreshToken } =
        await refreshTokenRequest(refreshToken);
      if (newAccessToken) {
        const newHeaders = new Headers(options.headers);
        newHeaders.set("Authorization", `Bearer ${newAccessToken}`);
        const newOptions: RequestInit = {
          ...options,
          headers: newHeaders,
        };
        response = await fetch(url, newOptions);
        if (newRefreshToken) {
          cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
          });
        }

        return { response, newAccessToken };
      }
    }
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error response from server:`, errorBody);
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorBody}`
    );
  }

  return { response };
}

async function refreshTokenRequest(refreshToken: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.jwt && data.refreshToken) {
        return { newAccessToken: data.jwt, newRefreshToken: data.refreshToken };
      }
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }

  return { newAccessToken: null, newRefreshToken: null };
}
