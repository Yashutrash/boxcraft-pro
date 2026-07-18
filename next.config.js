/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // Drastically reduce the watcher scope to stop it from escaping the project directory
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          'C:/*', // Prevent Windows C:\ drive scanning bug
        ],
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
