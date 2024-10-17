import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { Adapter } from 'next-auth/adapters';
import Google from 'next-auth/providers/google';

import prisma from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    Google({
      // allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Credentials({
      name: 'Credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email?: string;
          password?: string;
        };

        if (!email || !password) {
          throw new CredentialsSignin('Please provide both email and password');
        }
        const existingUser = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!existingUser) {
          throw new Error('Invalid email or password');
        }
        const isMatched = await compare(password, existingUser.password || '');

        if (!isMatched) {
          throw new Error('Password did not matched');
        }

        const userData = {
          email: existingUser.email,
          role: existingUser.role,
          id: existingUser.id + '',
        };

        return userData;
      },
    }),
  ],
  callbacks: {
    // authorized({ request: { nextUrl }, auth }) {
    //   console.log(
    //     'HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE'
    //   );
    //   console.log(auth);
    //   const isLoggedIn = !!auth?.user;
    //   const { pathname } = nextUrl;
    //   const role = auth?.user.role || 'user';
    //   if (pathname.startsWith('/login') && isLoggedIn) {
    //     return Response.redirect(new URL('/', nextUrl));
    //   }
    //   if (pathname.startsWith('/page2') && role !== 'admin') {
    //     return Response.redirect(new URL('/', nextUrl));
    //   }
    //   return !!auth;
    // },
    // jwt({ token, user, trigger, session }) {
    //   if (user) {
    //     token.id = user.id as string;
    //     token.role = user.role as string;
    //   }
    //   if (trigger === 'update' && session) {
    //     token = { ...token, ...session };
    //   }
    //   return token;
    // },

    //"user" return from authorize function
    async jwt({ token, user }) {
      // console.log('JWT - token >>', token);
      // console.log('JWT - user >>', user);
      if (user) {
        token.role = user.role;
        token.id = user.id as string;
      }
      return token;
    },
    session({ session, token }) {
      // console.log('SESSION - session >>', session);
      // console.log('SESSION - token >>', token);
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },

    // async session({ session, token }) {
    //   if (token?.sub && token?.role) {
    //     session.user.id = token.sub;
    //     session.user.role = token.role;
    //   }
    //   return session;
    // },

    // signIn: async ({ user, account }) => {
    //   if (account?.provider === 'google') {
    //     try {
    //       const { email } = user;

    //       if (email === undefined || email === null) return false;

    //       // const alreadyUser = await prisma.user.findUnique({
    //       //   where: { email: email },
    //       // });

    //       // if (!alreadyUser) {
    //       //   await prisma.user.create({
    //       //     data: {
    //       //       email: email,
    //       //       image: image,
    //       //       auth_provider_id: id,
    //       //     },
    //       //   });
    //       // }
    //       return true;
    //     } catch (error) {
    //       const err = error as Error;
    //       throw new Error('Error while creating user', err);
    //     }
    //   }

    //   if (account?.provider === 'credentials') {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
  },

  pages: {
    signIn: '/login',
  },
});
