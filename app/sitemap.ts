import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.APP_URL;
  return origin
    ? ["", "/reconcile", "/privacy", "/terms", "/contact"].map((path) => ({
        url: origin + path,
      }))
    : [];
}
