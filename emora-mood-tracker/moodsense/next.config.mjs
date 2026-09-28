/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // face-api.js has an optional Node-only fallback path (fs) that is
    // never used in the browser bundle; silence the harmless warning.
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
};

export default nextConfig;
