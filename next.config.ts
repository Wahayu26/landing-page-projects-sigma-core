import type { NextConfig } from "next";

const cmsAPIURL = new URL(process.env.CMS_API_URL?.trim() || "http://localhost:3101/api");

if (!["http:", "https:"].includes(cmsAPIURL.protocol)
  || cmsAPIURL.username
  || cmsAPIURL.password
  || cmsAPIURL.search
  || cmsAPIURL.hash) {
  throw new Error("CMS_API_URL must be an HTTP(S) API base without credentials, query or fragment.");
}

const cmsProtocol = cmsAPIURL.protocol === "https:" ? "https" : "http";
const cmsAPIPath = cmsAPIURL.pathname.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: cmsProtocol,
        hostname: cmsAPIURL.hostname,
        port: cmsAPIURL.port,
        pathname: `${cmsAPIPath}/media/file/**`,
        search: "",
      },
    ],
  },
};

export default nextConfig;
