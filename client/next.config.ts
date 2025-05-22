// next.config.js
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'www.ratethatclass.com',
            },
          ],
          destination: 'https://ratethatclass.com',
          permanent: true, // 301
        },
      ];
    },
  };
  
export default nextConfig;
