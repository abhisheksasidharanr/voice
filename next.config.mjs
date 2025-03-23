/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: "/agent",
  redirects: () => [
    {
      source: "/",
      destination: "/agent",
      permanent: false,
      basePath: false,
    },
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.deepgram.com",
        port: "",
        pathname: "/examples/avatars/**",
      },
    ],
  },

  // 🚫 Skip TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🚫 Skip ESLint checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
