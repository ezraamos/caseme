'use server';

import prisma from '@/db';
import { getSession } from '@/lib/getSession';

import { redirect } from 'next/navigation';

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const session = await getSession();
  if (!session) {
    redirect('/');
  }
  const { user } = session;

  if (!user?.id || !user.email) {
    throw new Error('You need to be logged in to view this page.');
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: Number(user.id) },
    include: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true,
      user: true,
    },
  });

  if (!order) throw new Error('This order does not exist.');

  if (order.isPaid) {
    return order;
  } else {
    return false;
  }
};
