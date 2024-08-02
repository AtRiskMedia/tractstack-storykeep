const BASE_URL = `/api/turso`;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchTurso(operation: string, data: any = {}) {
  try {
    const response = await fetch(`${BASE_URL}/${operation}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "same-origin",
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = `/storykeep/login?redirect=${window.location.pathname}`;
        throw new Error("Unauthorized. Please log in.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export const tursoClient = {
  test: () => fetchTurso("test"),
  //getResourcesBySlug: (slugs: string[]) => fetchTurso("getResourcesBySlug", { slugs }),
};
