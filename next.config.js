const devBuildMode = process.env.BUILD_MODE === 'dev';

console.log(`devBuildMode >> ${devBuildMode}`);

/** @type {import('next').NextConfig} */
const defaultConfig = {
  swcMinify: true,
};

/** @type {import('next').NextConfig} */
const devConfig = {
  ...defaultConfig,
};

/** @type {import('next').NextConfig} */
const prodConfig = {
  ...defaultConfig,
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
};

/** @type {import('next').NextConfig} */
const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

module.exports = config;
