/** @type {import('next').NextConfig} */
const isGhPages = process.env.GH_PAGES === '1';
const repoBase = '/eng-learing-app';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  ...(isGhPages ? { basePath: repoBase, assetPrefix: repoBase + '/' } : {}),
};
export default nextConfig;
