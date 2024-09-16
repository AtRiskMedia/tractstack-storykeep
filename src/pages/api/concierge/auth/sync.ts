import type { APIRoute } from "astro";
import { proxyRequestWithRefresh } from "../../../../api/authService";

const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const token = request.headers.get("Authorization");
  const refreshToken = request.headers.get("X-Refresh-Token");
  try {
    const { response, newRefreshToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/auth/sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(body),
      },
      refreshToken || undefined
    );
    const data = await response.json();
    return new Response(
      JSON.stringify({
        ...data,
        newRefreshToken: newRefreshToken,
      }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in auth sync route:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to sync auth",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
