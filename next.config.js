/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
};

module.exports = config;
