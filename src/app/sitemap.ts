import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    .replace(/\/$/, "");

  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/loja`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/quem-somos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/checkout`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/termos-de-servico`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/politica-de-privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}

