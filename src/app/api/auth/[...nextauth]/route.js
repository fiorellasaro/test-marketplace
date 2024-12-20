import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url === "/dashboard") {
        return `${baseUrl}/dashboard`;
      }

      if (url === "/") {
        return `${baseUrl}/`;
      }

      return url.startsWith(baseUrl) ? url : `${baseUrl}/marketplace`;
    },
  },
});

export { handler as GET, handler as POST };
