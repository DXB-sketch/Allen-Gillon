/** @type {import('next').NextConfig} */
export default {
  async redirects() {
    return [{ source: "/plays", destination: "/books#school-plays", permanent: true }];
  },
};
