/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./sqlite.db'],
  },
};

export default nextConfig;
