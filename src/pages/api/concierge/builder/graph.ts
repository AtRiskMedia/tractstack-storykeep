import type { APIRoute } from "astro";

const BACKEND_URL = import.meta.env.PUBLIC_CONCIERGE_BASE_URL;

export const GET: APIRoute = async ({ request }) => {
  const token = request.headers.get("Authorization");

  try {
    const response = await fetch(`${BACKEND_URL}/users/graph`, {
      headers: {
        Authorization: token || "",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
