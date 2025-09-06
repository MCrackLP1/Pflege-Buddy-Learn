/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')();
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['postgres']
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: false
  }
};

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
