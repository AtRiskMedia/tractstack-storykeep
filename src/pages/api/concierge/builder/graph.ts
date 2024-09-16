import type { APIRoute } from "astro";
import { proxyRequestWithRefresh } from "../../../../api/authService";

const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

export const GET: APIRoute = async context => {
  const { request } = context;
  const token = request.headers.get("Authorization");
  try {
    const { response, newAccessToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/users/graph`,
      {
        headers: {
          Authorization: token || "",
        },
      },
      context
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return new Response(
      JSON.stringify({
        data,
        newAccessToken,
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
