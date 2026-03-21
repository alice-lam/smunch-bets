/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  
  redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
