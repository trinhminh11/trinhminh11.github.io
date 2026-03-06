/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Uncomment and update the line below if deploying to a subdirectory
  // e.g., https://username.github.io/repo-name/
  // basePath: '/repo-name',
}

export default nextConfig
