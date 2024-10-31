import { defineMiddleware } from "astro:middleware";
import { isAuthenticated, isOpenDemoMode } from "./utils/session";
import { getSetupChecks } from "./utils/setupChecks";
import type { AuthStatus } from "./types";

/*
 * Middleware is not for protecting frontend proxy to concierge
 * it's meant for protecting the storykeep (and enabling the open demo)
 */

export const onRequest = defineMiddleware(async (context, next) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const auth = await isAuthenticated(context as any);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { hasTurso } = getSetupChecks();
  const isOpenDemo = hasTurso ? await isOpenDemoMode(context as any) : true;
  context.locals.user = { isAuthenticated: auth, isOpenDemo } as AuthStatus;

  const protectedRoutes = [
    "/*/edit",
    "/context/*/edit",
    "/storykeep",
    "/storykeep/create/*",
    "/storykeep/settings",
    "/api/turso/paneDesigns",
    "/api/turso/execute",
    "/api/turso/uniqueTailwindClasses",
    "/api/aai/lemurTask",
    "/api/concierge/storykeep/analytics",
    "/api/concierge/storykeep/dashboardAnalytics",
    "/api/concierge/storykeep/env",
  ];
  const openProtectedRoutes = [
    "/*/edit",
    "/context/*/edit",
    "/storykeep",
    "/storykeep/create/*",
    "/api/turso/paneDesigns",
    "/api/aai/lemurTask",
    "/api/concierge/storykeep/analytics",
    "/api/concierge/storykeep/dashboardAnalytics",
  ];
  const publicRoutes = [
    "/storykeep/login",
    "/storykeep/logout",
    "/api/concierge/auth/sync",
    "/api/concierge/events/stream",
    "/api/concierge/auth/profile",
    "/api/concierge/auth/graph",
  ];

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
    if (isOpenDemo) {
      if (isOpenProtectedRoute) {
        return next();
      } else {
        if (context.url.pathname.startsWith("/api/storykeep/")) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        return context.redirect("/");
      }
    }

    if (
      context.url.pathname.startsWith("/api/turso/") ||
      context.url.pathname.startsWith("/api/storykeep/")
    ) {
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
