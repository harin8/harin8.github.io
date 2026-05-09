import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/timeline`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/chat`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
