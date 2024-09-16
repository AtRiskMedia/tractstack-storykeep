import type { APIRoute } from "astro";
import { proxyRequestWithRefresh } from "../../../../api/authService";

const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

export const GET: APIRoute = async ({ request }) => {
  const token = request.headers.get("Authorization");
  try {
    const { response, newRefreshToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/users/graph`,
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
        data,
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
    console.error("Error in graph route:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to get graph",
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
