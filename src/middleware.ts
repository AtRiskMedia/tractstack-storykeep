import { defineMiddleware } from "astro:middleware";
import { isAuthenticated } from "./utils/session";

export const onRequest = defineMiddleware(async (context, next) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const auth = await isAuthenticated(context as any);
  context.locals.user = { isAuthenticated: auth };

  const protectedRoutes = ["/*/edit", "/storykeep/create"];
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.includes("*")) {
      const regex = new RegExp("^" + route.replace("*", ".*"));
      return regex.test(context.url.pathname);
    }
    return context.url.pathname.startsWith(route);
  });

  if (auth && context.url.pathname === "/storykeep/login") {
    return context.redirect("/");
  }

  if (!auth && isProtectedRoute) {
    return context.redirect(
      `/storykeep/login?redirect=${context.url.pathname}`
    );
  }

  return next();
});
