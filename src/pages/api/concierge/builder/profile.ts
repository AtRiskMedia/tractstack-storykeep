import type { APIRoute } from "astro";
import { proxyRequestWithRefresh } from "../../../../api/authService";

const BACKEND_URL = import.meta.env.PRIVATE_CONCIERGE_BASE_URL;

export const GET: APIRoute = async context => {
  const { request } = context;
  const token = request.headers.get("Authorization");
  try {
    const { response, newAccessToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/users/profile`,
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
        ...data,
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

export const POST: APIRoute = async context => {
  const { request } = context;
  const body = await request.json();
  const { ...profileData } = body;
  const token = request.headers.get("Authorization");

  try {
    const { response, newAccessToken } = await proxyRequestWithRefresh(
      `${BACKEND_URL}/users/profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify(profileData),
      },
      context
    );
    const responseData = await response.json();
    return new Response(
      JSON.stringify({
        ...responseData,
        newAccessToken,
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
