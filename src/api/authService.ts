const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

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
    }
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error response from server:`, errorBody);
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorBody}`
    );
  }

  return { response, newRefreshToken };
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
    const responseText = await response.text();
    if (response.ok && responseText) {
      try {
        const data = JSON.parse(responseText);
        if (data.jwt && data.refreshToken) {
          return { jwt: data.jwt, newRefreshToken: data.refreshToken };
        }
      } catch (error) {
        console.error("Error parsing refresh token response:", error);
      }
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
  }

  return { jwt: null, newRefreshToken: null };
}
