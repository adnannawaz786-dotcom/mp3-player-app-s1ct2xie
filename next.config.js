/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  webpack: (config, { isServer }) => {
    // Add support for audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
          name: '[name].[hash].[ext]'
        }
      }
    });

    // Optimize for audio processing
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }

    return config;
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  env: {
    CUSTOM_KEY: 'mp3-player-app'
  }
};

module.exports = nextConfig;