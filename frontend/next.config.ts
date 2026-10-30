import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Reenvía al microservicio de Spring Boot lo que llegue a /api.
  // Así el navegador habla con una sola dirección y no hay CORS de por medio.
  async rewrites() {
    return [
      {
        source: "/api/:ruta*",
        destination: "http://localhost:8081/api/:ruta*",
      },
    ];
  },

  // Permite que el servidor de desarrollo acepte peticiones desde el túnel.
  allowedDevOrigins: ["*.trycloudflare.com"],

  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;