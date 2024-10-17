'use server';
import { signIn, signOut } from '@/auth';
import prisma from '@/db';
import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';

const register = async (formData: FormData) => {
  const firstName = formData.get('firstname') as string;
  const lastName = formData.get('lastname') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!firstName || !lastName || !email || !password) {
    throw new Error('Please fill all fields');
  }

  const isUserExist = await prisma.user.findUnique({ where: { email } });

  if (isUserExist) {
    throw new Error('User already exist');
  }

  // HASH password
  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: hashedPassword,
    },
  });

  redirect('/login');
};

const login = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  await signIn('credentials', { email, password, redirect: false });
  redirect('/');
};

const signout = async () => {
  await signOut({ redirectTo: '/' });
};

const googleSignin = async () => {
  await signIn('google', { redirectTo: '/' });
};

export { register, login, signout, googleSignin };
