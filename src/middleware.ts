import { defineMiddleware } from "astro:middleware";
import { isAuthenticated, isOpenDemoMode } from "./utils/session";
import type { AuthStatus } from "./types";

export const onRequest = defineMiddleware(async (context, next) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const auth = await isAuthenticated(context as any);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const isOpenDemo = await isOpenDemoMode(context as any);
  context.locals.user = { isAuthenticated: auth, isOpenDemo } as AuthStatus;

  const protectedRoutes = [
    "/*/edit",
    "/storykeep/create",
    "/api/turso/paneDesigns",
    //"/api/concierge/builder/*",
  ];
  const openProtectedRoutes = [
    "/*/edit",
    "/storykeep/create",
    "/api/turso/paneDesigns",
  ];
  const publicRoutes = ["/storykeep/login", "/storykeep/logout"];

  const isPublicRoute = publicRoutes.includes(context.url.pathname);

  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.includes("*")) {
      const regex = new RegExp("^" + route.replace("*", ".*"));
      return regex.test(context.url.pathname);
    }
    return context.url.pathname === route;
  });

  const isOpenProtectedRoute = openProtectedRoutes.some(route => {
    if (route.includes("*")) {
      const regex = new RegExp("^" + route.replace("*", ".*"));
      return regex.test(context.url.pathname);
    }
    return context.url.pathname === route;
  });

  const url = new URL(context.request.url);
  const forceLogin = url.searchParams.get("force") === "true";

  if (auth && !forceLogin && context.url.pathname === "/storykeep/login") {
    return context.redirect("/");
  }

  if (!auth && isProtectedRoute && !isPublicRoute) {
    if (isOpenDemo && isOpenProtectedRoute && !forceLogin) {
      return next();
    }
    if (context.url.pathname.startsWith("/api/turso/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return context.redirect(
      `/storykeep/login?redirect=${context.url.pathname}${forceLogin ? "&force=true" : ""}`
    );
  }
  return next();
});
