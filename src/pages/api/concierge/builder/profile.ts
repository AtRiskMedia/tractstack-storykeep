import type { APIRoute } from "astro";
import { proxyRequestWithRefresh } from "../../../../api/authService";

const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

export const GET: APIRoute = async ({ request }) => {
  const token = request.headers.get("Authorization");
  try {
    const { response, newRefreshToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/users/profile`,
      {
        headers: {
          Authorization: token || "",
        },
      },
      undefined // No refresh token for GET request
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return new Response(
      JSON.stringify({
        ...data,
        newRefreshToken,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in profile get route:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to load profile",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { refreshToken, ...profileData } = body;
  const token = request.headers.get("Authorization");

  try {
    const { response, newRefreshToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/users/profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(profileData),
      },
      refreshToken
    );
    const responseData = await response.json();
    return new Response(
      JSON.stringify({
        ...responseData,
        newRefreshToken,
      }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
