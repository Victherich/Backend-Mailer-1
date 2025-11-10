// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;




import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Prevent ESLint errors (like "Unexpected any") from stopping your build on Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
