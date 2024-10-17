// types/next-auth.d.ts

import 'next-auth';
import 'next-auth/jwt';

//User -> JWT -> Session(user)

declare module 'next-auth' {
  interface User extends AdapterUser {
    id: string;
    role: string;
  }
  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
