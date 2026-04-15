import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN:
      process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN || "",
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_DATE:
      process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE || "",
  },
};

export default nextConfig;
