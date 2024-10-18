'use server';

import prisma from '@/db';
import { OrderStatus } from '@prisma/client';

export const changeOrderStatus = async ({
  id,
  newStatus,
}: {
  id: string;
  newStatus: OrderStatus;
}) => {
  await prisma.order.update({
    where: { id },
    data: { status: newStatus },
  });
};
