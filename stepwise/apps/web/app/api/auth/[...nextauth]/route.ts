import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "FastifyAuth",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // POST to Fastify API
          const res = await fetch(`${API_URL}/auth/login/password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // The response will just be JSON containing our error or our LoginResult
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Authentication failed");
          }

          // Return user object mapped to NextAuth expected fields.
          // We strictly attach the proxy JWT from fastify directly into the user obj
          return {
            id: data.userId,
            email: data.email,
            name: data.username,
            fastifyToken: data.token,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First login -> populate token with fastifyToken
        token.id = user.id;
        token.fastifyToken = (user as any).fastifyToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Expose Fastify token to the client session
        (session as any).fastifyToken = token.fastifyToken;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom page route
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
