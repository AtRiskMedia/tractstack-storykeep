import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.tractstack.com",
      },
    ],
  },
  site: SITE.website,
  integrations: [tailwind(), react()],
  scopedStyleStrategy: "where",
});
