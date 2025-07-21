/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [],
  },
  webpack: (config: { module: { rules: { test: RegExp; use: { loader: string; }; }[]; }; resolve: { fallback: { fs: boolean; path: boolean; canvas: boolean; }; }; }) => {
    config.module.rules.push({
      test: /\.(glb|gltf|bin|png|jpe?g|gif)$/,
      use: {
        loader: 'file-loader',
      },
    });

    // Important: Handle Three.js canvas context
    config.resolve.fallback = { 
      fs: false,
      path: false,
      canvas: false,
    };

    return config;
  },
};

module.exports = nextConfig;
