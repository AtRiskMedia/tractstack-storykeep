import type { APIRoute } from "astro";
import { proxyRequestWithRefresh } from "../../../../api/authService";

const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

export const POST: APIRoute = async ({ request }) => {
  let body;
  try {
    body = await request.json();
    const { refreshToken, ...restBody } = body;

    const token = request.headers.get("Authorization");
    const { response, newRefreshToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/users/eventStream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(restBody),
      },
      refreshToken
    );

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      responseData = { error: "Failed to parse response" };
    }

    // Include the new refresh token in the response to the client
    return new Response(
      JSON.stringify({
        ...responseData,
        newRefreshToken: newRefreshToken,
      }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in event stream route:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to push events",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
