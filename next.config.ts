/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Add this for Three.js compatibility
  webpack: (config: { module: { rules: { test: RegExp; use: { loader: string; }; }[]; }; }) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
      },
    });

    return config;
  },
};

module.exports = nextConfig;
