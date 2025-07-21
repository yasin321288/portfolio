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
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.app;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data:;
              font-src 'self';
              connect-src 'self';
              media-src 'self';
              object-src 'none';
              frame-src 'none';
              base-uri 'self';
              form-action 'self';
              worker-src 'self' blob:;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  },
  webpack: (config: { devtool: string; resolve: { fallback: { fs: boolean; path: boolean; canvas: boolean; }; }; }) => {
    // Disable eval source maps
    config.devtool = 'source-map';
    
    // Add Three.js fallbacks
    config.resolve.fallback = { 
      fs: false,
      path: false,
      canvas: false,
    };

    return config;
  },
};

module.exports = nextConfig;
