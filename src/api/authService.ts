const BACKEND_URL = import.meta.env.PUBLIC_CONCIERGE_BASE_URL;

export async function proxyRequestWithRefresh(
  url: string,
  options: RequestInit,
  refreshToken?: string
) {
  let response = await fetch(url, options);
  let newRefreshToken = null;

  if (response.status === 401 && refreshToken) {
    const { jwt: newToken, newRefreshToken: newRefresh } =
      await refreshTokenRequest(refreshToken);

    if (newToken) {
      const newHeaders = new Headers(options.headers);
      newHeaders.set("Authorization", `Bearer ${newToken}`);

      const newOptions: RequestInit = {
        ...options,
        headers: newHeaders,
      };

      response = await fetch(url, newOptions);
      newRefreshToken = newRefresh;
    } else {
      console.log("Failed to obtain new token");
    }
  } else if (response.status === 401) {
    console.log("Received 401, but no refresh token available");
  }

  return { response, newRefreshToken };
}

async function refreshTokenRequest(
  refreshToken: string
): Promise<{ jwt: string | null; newRefreshToken: string | null }> {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const responseText = await response.text();

    if (response.ok && responseText) {
      try {
        const data = JSON.parse(responseText);
        if (data.jwt && data.refreshToken) {
          return { jwt: data.jwt, newRefreshToken: data.refreshToken };
        } else {
          console.log("JWT or refresh token not found in response");
        }
      } catch (error) {
        console.error("Error parsing refresh token response:", error);
      }
    } else {
      console.log("Failed to refresh token or empty response");
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }

  return { jwt: null, newRefreshToken: null };
}
