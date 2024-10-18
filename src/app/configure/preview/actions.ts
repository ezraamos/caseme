'use server';

import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products';
import prisma from '@/db';
import { getSession } from '@/lib/getSession';
import { stripe } from '@/lib/stripe';

import { Order } from '@prisma/client';

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string;
}) => {
  const configuration = await prisma.configuration.findUnique({
    where: { id: configId },
  });
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL as string;

  if (!serverUrl) {
    throw new Error('Server URL is not defined in environment variables');
  }

  if (!configuration) {
    throw new Error('No such configuration found');
  }

  const session = await getSession();
  if (!session) {
    throw new Error('No session found');
  }
  const { user } = session;

  if (!user) {
    throw new Error('You need to be logged in');
  }

  const { finish, material } = configuration;

  let price = BASE_PRICE;
  if (finish === 'textured') price += PRODUCT_PRICES.finish.textured;
  if (material === 'polycarbonate')
    price += PRODUCT_PRICES.material.polycarbonate;

  let order: Order | undefined = undefined;

  const existingOrder = await prisma.order.findFirst({
    where: {
      userId: Number(user.id),
      configurationId: configuration.id,
    },
  });

  console.log(user.id, configuration.id);

  if (existingOrder) {
    order = existingOrder;
  } else {
    order = await prisma.order.create({
      data: {
        amount: price / 100,
        userId: Number(user.id),
        configurationId: configuration.id,
      },
    });
  }

  const product = await stripe.products.create({
    name: 'Custom iPhone Case',
    images: [configuration.imageUrl],
    default_price_data: {
      currency: 'USD',
      unit_amount: price,
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${serverUrl}/thank-you?orderId=${order.id}`,
    cancel_url: `${serverUrl}/configure/preview?id=${configuration.id}`,
    payment_method_types: ['card'],
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['PH', 'US'] },
    metadata: {
      userId: user.id as string,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  });
  //checkout page by stripe
  return { url: stripeSession.url };
};
